import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// CustomerSupplier türü
interface CustomerSupplier {
  id: number;
  title: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  countryCode?: string;
  isSupplier: boolean;
}

// Product türü
interface Product {
  stock_code: string;
  description: string;
  measurement_unit: string;
  balance: number;
}

// InvoiceDetail türü
interface InvoiceDetail {
  tempId: string; // Geçici ID (kayıtta kullanılmaz)
  product_code: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  description?: string;
  productName?: string; // UI için kullanım
}

// Invoice türü
interface InvoiceData {
  invoiceType: 'Satis' | 'Alis';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  customerSupplierId?: number;
  taxNumber?: string; // Manuel giriş için
  customerTitle?: string; // Manuel giriş için
  isInternational: boolean;
  transactionType?: 'Ihracat' | 'Ithalat' | 'YurtIci';
  currency: string;
  totalAmount: number;
  vatRate: number | null;
  vatAmount: number | null;
  isVatExempt: boolean;
  vatExemptionReason?: string;
  customsDeclarationNumber?: string;
  exportCountryCode?: string;
  importCountryCode?: string;
  exportDate?: string;
  importDate?: string;
  deliveryTerms?: string;
  gtipCode?: string;
  vatRefundStatus: 'Basvurulmadi' | 'Basvuruldu' | 'Onaylandi' | 'Reddedildi';
  vatRefundApplicationDate?: string;
  ggb_id?: string;
  return_eligible_transaction_type?: string;
  deduction_kdv_period?: string;
  upload_kdv_period?: string;
  invoiceDetails: InvoiceDetail[];
}

interface InvoiceFormProps {
  customers: CustomerSupplier[];
  products: Product[];
  showForm: boolean;
  onToggleForm: () => void;
  onAddInvoice: (invoiceData: any) => Promise<void>;
}

const defaultInvoiceState = (): InvoiceData => ({
  invoiceType: 'Alis',
  invoiceNumber: '',
  invoiceDate: format(new Date(), 'yyyy-MM-dd'),
  dueDate: '',
  customerSupplierId: undefined,
  taxNumber: '',
  customerTitle: '',
  isInternational: false,
  transactionType: 'YurtIci',
  currency: 'TRY',
  totalAmount: 0,
  vatRate: 18,
  vatAmount: 0,
  isVatExempt: false,
  vatExemptionReason: '',
  vatRefundStatus: 'Basvurulmadi',
  invoiceDetails: []
});

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  customers, 
  products,
  showForm, 
  onToggleForm, 
  onAddInvoice
}) => {
  const [invoice, setInvoice] = useState<InvoiceData>(defaultInvoiceState());
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSupplier[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Yeni detay girişi için state
  const [newDetail, setNewDetail] = useState<InvoiceDetail>({
    tempId: uuidv4(),
    product_code: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    description: ''
  });
  
  // Ürün önerileri için state
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  // Toplam tutarları hesapla
  useEffect(() => {
    const subtotal = invoice.invoiceDetails.reduce((sum, item) => sum + item.totalAmount, 0);
    const vatAmount = invoice.isVatExempt ? 0 : 
      (invoice.vatRate ? subtotal * (invoice.vatRate / 100) : 0);
    
    setInvoice(prev => ({
      ...prev,
      totalAmount: subtotal,
      vatAmount: vatAmount
    }));
  }, [invoice.invoiceDetails, invoice.vatRate, invoice.isVatExempt]);

  // Yeni detay kaleminin toplam tutarını otomatik hesapla
  useEffect(() => {
    const total = newDetail.quantity * newDetail.unitPrice;
    setNewDetail(prev => ({
      ...prev,
      totalAmount: total
    }));
  }, [newDetail.quantity, newDetail.unitPrice]);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setInvoice(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTaxNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInvoice(prev => ({ ...prev, taxNumber: value }));
    
    // Vergi numarasına göre öneri göster
    if (value.length >= 2) {
      const matchingCustomers = customers.filter(c => 
        c.taxNumber && c.taxNumber.toLowerCase().includes(value.toLowerCase())
      );
      setCustomerSuggestions(matchingCustomers);
      setShowSuggestions(matchingCustomers.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (customer: CustomerSupplier) => {
    setInvoice(prev => ({
      ...prev,
      taxNumber: customer.taxNumber || '',
      customerTitle: customer.title,
      customerSupplierId: customer.id
    }));
    setShowSuggestions(false);
  };

  // Detay kalemi form işleyicileri
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDetail(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value
    }));
    
    // Ürün kodu değiştiğinde ürün önerilerini göster
    if (name === 'product_code' && products?.length) {
      const matchingProducts = products.filter(p => 
        p.stock_code.toLowerCase().includes(value.toLowerCase()) ||
        p.description.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setProductSuggestions(matchingProducts);
      setShowProductSuggestions(matchingProducts.length > 0);
    }
  };

  const selectProduct = (product: Product) => {
    setNewDetail(prev => ({
      ...prev,
      product_code: product.stock_code,
      productName: product.description
    }));
    setShowProductSuggestions(false);
  };

  const addDetailItem = () => {
    if (!newDetail.product_code || newDetail.quantity <= 0 || newDetail.unitPrice <= 0) {
      alert('Lütfen geçerli ürün kodu, miktar ve birim fiyat giriniz.');
      return;
    }

    setInvoice(prev => ({
      ...prev,
      invoiceDetails: [...prev.invoiceDetails, { ...newDetail, tempId: uuidv4() }]
    }));

    // Yeni detay formunu temizle
    setNewDetail({
      tempId: uuidv4(),
      product_code: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      description: '',
      productName: ''
    });
  };

  const removeDetailItem = (tempId: string) => {
    setInvoice(prev => ({
      ...prev,
      invoiceDetails: prev.invoiceDetails.filter(item => item.tempId !== tempId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invoice.invoiceDetails.length === 0) {
      alert('En az bir fatura detayı eklemeniz gerekmektedir.');
      return;
    }
    
    // API'ye göndermek için fatura verisini hazırla
    const preparedInvoiceDetails = invoice.invoiceDetails.map(({ tempId, productName, ...rest }) => rest);
    
    const invoiceData = {
      ...invoice,
      vatRate: invoice.vatRate ? Number(invoice.vatRate) : null,
      vatAmount: invoice.vatAmount ? Number(invoice.vatAmount) : null,
      invoiceDetails: preparedInvoiceDetails
    };
    
    try {
      await onAddInvoice(invoiceData);
      // Başarılı işlem sonrası formu sıfırla
      setInvoice(defaultInvoiceState());
    } catch (error) {
      console.error('Fatura eklenirken hata oluştu:', error);
      alert('Fatura eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Yeni Fatura Ekle</h2>
        <Button 
          onClick={onToggleForm}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {showForm ? 'Formu Gizle' : 'Fatura Formu Göster'}
        </Button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fatura ana bilgileri bölümü */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Fatura Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Temel Fatura Bilgileri */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Fatura Tipi</label>
                <select
                  name="invoiceType"
                  value={invoice.invoiceType}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="Satis">Satış Faturası</option>
                  <option value="Alis">Alış Faturası</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Fatura Numarası</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoice.invoiceNumber}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Fatura Tarihi</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={invoice.invoiceDate}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Vade Tarihi</label>
                <input
                  type="date"
                  name="dueDate"
                  value={invoice.dueDate || ''}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              {/* Vergi/TC Kimlik No girişi */}
              <div className="relative">
                <label className="block text-gray-700 text-sm font-bold mb-2">Vergi/TC Kimlik No</label>
                <input
                  type="text"
                  name="taxNumber"
                  value={invoice.taxNumber || ''}
                  onChange={handleTaxNumberChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Vergi/TC Kimlik No"
                />
                
                {/* Öneriler dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                    {customerSuggestions.map(customer => (
                      <div 
                        key={customer.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="font-semibold">{customer.title}</div>
                        <div className="text-sm text-gray-600">VKN/TCKN: {customer.taxNumber}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Müşteri/Tedarikçi Adı</label>
                <input
                  type="text"
                  name="customerTitle"
                  value={invoice.customerTitle || ''}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Unvan"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-gray-700 text-sm font-bold">
                  <input
                    type="checkbox"
                    name="isInternational"
                    checked={invoice.isInternational}
                    onChange={handleInvoiceChange}
                    className="mr-2"
                  />
                  Yurt Dışı İşlemi
                </label>
              </div>

              {invoice.isInternational && (
                <>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">İşlem Tipi</label>
                    <select
                      name="transactionType"
                      value={invoice.transactionType || ''}
                      onChange={handleInvoiceChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="Ihracat">İhracat</option>
                      <option value="Ithalat">İthalat</option>
                      <option value="YurtIci">Yurt İçi</option>
                    </select>
                  </div>

                  {(invoice.transactionType === 'Ihracat' || invoice.transactionType === 'Ithalat') && (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {invoice.transactionType === 'Ihracat' ? 'İhracat Ülkesi' : 'İthalat Ülkesi'}
                        </label>
                        <input
                          type="text"
                          name={invoice.transactionType === 'Ihracat' ? 'exportCountryCode' : 'importCountryCode'}
                          value={invoice.transactionType === 'Ihracat' ? 
                            invoice.exportCountryCode || '' : 
                            invoice.importCountryCode || ''
                          }
                          onChange={handleInvoiceChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="Ülke kodu (2 karakter)"
                          maxLength={2}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {invoice.transactionType === 'Ihracat' ? 'İhracat Tarihi' : 'İthalat Tarihi'}
                        </label>
                        <input
                          type="date"
                          name={invoice.transactionType === 'Ihracat' ? 'exportDate' : 'importDate'}
                          value={invoice.transactionType === 'Ihracat' ? 
                            invoice.exportDate || '' : 
                            invoice.importDate || ''
                          }
                          onChange={handleInvoiceChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Gümrük Beyanname No</label>
                        <input
                          type="text"
                          name="customsDeclarationNumber"
                          value={invoice.customsDeclarationNumber || ''}
                          onChange={handleInvoiceChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">GTIP Kodu</label>
                        <input
                          type="text"
                          name="gtipCode"
                          value={invoice.gtipCode || ''}
                          onChange={handleInvoiceChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Para Birimi</label>
                <select
                  name="currency"
                  value={invoice.currency}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="TRY">TRY - Türk Lirası</option>
                  <option value="USD">USD - Amerikan Doları</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - İngiliz Sterlini</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">KDV Oranı (%)</label>
                <select
                  name="vatRate"
                  value={invoice.vatRate === null ? '' : String(invoice.vatRate)}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled={invoice.isVatExempt}
                >
                  <option value="0">0%</option>
                  <option value="1">1%</option>
                  <option value="8">8%</option>
                  <option value="10">10%</option>
                  <option value="18">18%</option>
                  <option value="20">20%</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-gray-700 text-sm font-bold">
                  <input
                    type="checkbox"
                    name="isVatExempt"
                    checked={invoice.isVatExempt}
                    onChange={handleInvoiceChange}
                    className="mr-2"
                  />
                  KDV Muafiyeti
                </label>
              </div>

              {invoice.isVatExempt && (
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">KDV Muafiyet Nedeni</label>
                  <input
                    type="text"
                    name="vatExemptionReason"
                    value={invoice.vatExemptionReason || ''}
                    onChange={handleInvoiceChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fatura Detayları Bölümü */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4">Fatura Detayları</h3>
            
            {/* Detay ekleme formu */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <div className="md:col-span-2 relative">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Ürün Kodu</label>
                  <input
                    type="text"
                    name="product_code"
                    value={newDetail.product_code}
                    onChange={handleDetailChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Ürün kodu"
                  />
                  
                  {/* Ürün önerileri dropdown */}
                  {showProductSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                      {productSuggestions.map(product => (
                        <div 
                          key={product.stock_code}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectProduct(product)}
                        >
                          <div className="font-semibold">{product.stock_code}</div>
                          <div className="text-sm text-gray-600">{product.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Miktar</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newDetail.quantity}
                    onChange={handleDetailChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Birim Fiyat</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={newDetail.unitPrice}
                    onChange={handleDetailChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Toplam Tutar</label>
                  <input
                    type="number"
                    value={newDetail.totalAmount}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-400 leading-tight bg-gray-100"
                    disabled
                  />
                </div>
                
                <div className="md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    onClick={addDetailItem}
                    className="bg-blue-500 hover:bg-blue-600 w-full"
                  >
                    Ekle
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Açıklama</label>
                <textarea
                  name="description"
                  value={newDetail.description}
                  onChange={handleDetailChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={1}
                />
              </div>
            </div>
            
            {/* Eklenen detay kalemleri tablosu */}
            {invoice.invoiceDetails.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-3 border-b text-left">Ürün Kodu</th>
                      <th className="py-2 px-3 border-b text-left">Miktar</th>
                      <th className="py-2 px-3 border-b text-left">Birim Fiyat</th>
                      <th className="py-2 px-3 border-b text-left">Toplam Tutar</th>
                      <th className="py-2 px-3 border-b text-left">Açıklama</th>
                      <th className="py-2 px-3 border-b"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.invoiceDetails.map((detail) => (
                      <tr key={detail.tempId}>
                        <td className="py-2 px-3 border-b">{detail.product_code}</td>
                        <td className="py-2 px-3 border-b">{detail.quantity}</td>
                        <td className="py-2 px-3 border-b">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(detail.unitPrice)}
                        </td>
                        <td className="py-2 px-3 border-b">
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(detail.totalAmount)}
                        </td>
                        <td className="py-2 px-3 border-b">{detail.description}</td>
                        <td className="py-2 px-3 border-b text-right">
                          <button
                            type="button"
                            onClick={() => removeDetailItem(detail.tempId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="py-2 px-3 border-b text-right font-bold">Ara Toplam:</td>
                      <td className="py-2 px-3 border-b font-bold">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(invoice.totalAmount)}
                      </td>
                      <td colSpan={2} className="py-2 px-3 border-b"></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="py-2 px-3 border-b text-right font-bold">
                        KDV ({invoice.isVatExempt ? 'Muaf' : `%${invoice.vatRate}`}):
                      </td>
                      <td className="py-2 px-3 border-b font-bold">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format(invoice.vatAmount || 0)}
                      </td>
                      <td colSpan={2} className="py-2 px-3 border-b"></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="py-2 px-3 border-b text-right font-bold">Genel Toplam:</td>
                      <td className="py-2 px-3 border-b font-bold">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: invoice.currency }).format((invoice.totalAmount || 0) + (invoice.vatAmount || 0))}
                      </td>
                      <td colSpan={2} className="py-2 px-3 border-b"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          
          {/* KDV İade Bilgileri */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span>KDV İade Bilgileri</span>
              <span className="text-sm font-normal ml-2 text-gray-500">(Opsiyonel)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">KDV İade Durumu</label>
                <select
                  name="vatRefundStatus"
                  value={invoice.vatRefundStatus}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Basvurulmadi">Başvurulmadı</option>
                  <option value="Basvuruldu">Başvuruldu</option>
                  <option value="Onaylandi">Onaylandı</option>
                  <option value="Reddedildi">Reddedildi</option>
                </select>
              </div>
              
              {invoice.vatRefundStatus !== 'Basvurulmadi' && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">KDV İade Başvuru Tarihi</label>
                  <input
                    type="date"
                    name="vatRefundApplicationDate"
                    value={invoice.vatRefundApplicationDate || ''}
                    onChange={handleInvoiceChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">GGB Tescil No</label>
                <input
                  type="text"
                  name="ggb_id"
                  value={invoice.ggb_id || ''}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">İade Hakkı Doğuran İşlem Türü</label>
                <input
                  type="text"
                  name="return_eligible_transaction_type"
                  value={invoice.return_eligible_transaction_type || ''}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">İndirim KDV Dönem</label>
                <input
                  type="text"
                  name="deduction_kdv_period"
                  value={invoice.deduction_kdv_period || ''}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Örn: 2023/05"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Belge Yüklendiği KDV Dönem</label>
                <input
                  type="text"
                  name="upload_kdv_period"
                  value={invoice.upload_kdv_period || ''}
                  onChange={handleInvoiceChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Örn: 2023/05"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button"
              onClick={onToggleForm}
              variant="outline"
              className="border-gray-300"
            >
              İptal
            </Button>
            <Button 
              type="submit"
              className="bg-green-500 hover:bg-green-600"
            >
              Fatura Ekle
            </Button>
          </div>
        </form>
      )}
    </>
  );
};

export default InvoiceForm;
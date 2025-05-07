"use client";

import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../utils/axios';
import AddStockForm from '@/components/features/stock/AddStockForm';
import InvoiceForm from '@/components/features/stock/InvoiceForm';
import StockTable from '@/components/features/stock/StockTable';
import AddCustomerForm from '@/components/features/stock/AddCustomerForm';
import { AlertMessage } from '@/components/ui/alert/AlertMessage';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui/card/Card';

const StockPage = () => {
  // Mevcut state'ler...
  const [loading, setLoading] = useState(false); // Başlangıçta false olarak ayarlayın
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [customers, setCustomers] = useState([]);
  
  // Açılır/kapanır panel durumları
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showStockTable, setShowStockTable] = useState(false); // Başlangıçta kapalı olarak başlasın
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  
  // Veri yükleme kontrolü için ref kullan
  const stocksLoaded = useRef(false);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Müşteri/Tedarikçi listesi yüklenirken bir hata oluştu.');
    }
  };

  const fetchStocks = async (page = 0, limit = 25, sortField = null, sortOrder = null, filter = '') => {
    // Eğer veri zaten yüklendiyse ve sayfa değiştirmiyorsak tekrar yükleme
    if (stocksLoaded.current && page === 0 && !sortField && !filter) {
      console.log('Stok verileri zaten yüklenmiş, yeniden yükleme yapılmıyor.');
      return;
    }
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(page + 1));
      params.append('limit', String(limit));
      
      if (sortField) {
        params.append('sortBy', sortField);
        params.append('sortOrder', sortOrder ? 'DESC' : 'ASC');
      }
      
      if (filter) {
        params.append('filter', filter);
      }
      
      console.log(`Stok verileri yükleniyor: sayfa=${page}, limit=${limit}`);
      
      try {
        const response = await axiosInstance.get(`/stock?${params.toString()}`);
        
        console.log('Yüklenen stok verileri:', response.data);
        
        if (response.data && Array.isArray(response.data.items)) {
          setData(response.data.items);
          setTotalCount(response.data.meta?.totalItems || 0);
        } else if (Array.isArray(response.data)) {
          setData(response.data);
          setTotalCount(response.data.length);
        } else {
          console.error('Beklenmeyen veri yapısı:', response.data);
          setData([]);
          setTotalCount(0);
        }
        
        // Veri başarıyla yüklendiğini işaretle
        stocksLoaded.current = true;
      } catch (error) {
        console.error('API hatası:', error);
        setData([]);
        setTotalCount(0);
        throw error;
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error('Stok verilerini yüklerken hata:', err);
      setError('Stok öğeleri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde sadece müşterileri getir, stok verilerini getirme
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Stok listesi açılıp kapandığında veri yükleme mantığını yönet
  useEffect(() => {
    // Stok tablosu gösteriliyorsa ve henüz veri yüklenmemişse, verileri yükle
    if (showStockTable && !stocksLoaded.current) {
      fetchStocks();
    }
  }, [showStockTable]);

  // Yeni müşteri/tedarikçi ekleme fonksiyonu
  const handleAddCustomer = async (customerData) => {
    try {
      await axiosInstance.post('/customers', customerData);
      setSuccessMessage('Müşteri/Tedarikçi başarıyla eklendi!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchCustomers();
    } catch (err) {
      console.error('Error creating customer/supplier:', err);
      setError('Müşteri/Tedarikçi eklenirken bir hata oluştu.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Stok ekleme işleyicisi
  const handleAddStock = async (stockData) => {
    try {
      await axiosInstance.post('/stock', stockData);
      setSuccessMessage('Stok öğesi başarıyla eklendi!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Stok verisi değiştiğinde, yeniden yüklenmesi gerektiğini işaretle
      stocksLoaded.current = false;
      
      // Eğer stok tablosu görünüyorsa verileri hemen güncelle
      if (showStockTable) {
        fetchStocks();
      }
    } catch (err) {
      console.error('Error creating stock item:', err);
      setError('Stok öğesi eklenirken bir hata oluştu.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Stok listesini göster/gizle butonunun işleyicisi
  const toggleStockTable = () => {
    setShowStockTable(!showStockTable);
  };

  // Diğer handler fonksiyonları...
  const handleAddInvoice = async (invoiceData) => {
    // Mevcut kod
  };

  const handleQrCodeGeneration = async (stockCode, measurementUnit) => {
    // Mevcut kod
  };

  const handleBulkUpload = async (stockItems) => {
    try {
      const response = await axiosInstance.post('/stock/bulk', stockItems);
      setSuccessMessage(`${response.data.length} adet stok başarıyla eklendi!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Stok verisi değiştiğinde, yeniden yüklenmesi gerektiğini işaretle
      stocksLoaded.current = false;
      
      // Eğer stok tablosu görünüyorsa verileri hemen güncelle
      if (showStockTable) {
        fetchStocks();
      }
    } catch (error) {
      console.error('CSV yükleme hatası:', error);
      setError(`Stok ekleme sırasında bir hata oluştu: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Stok Yönetimi</h1>
      
      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {error && <AlertMessage type="error" message={error} />}
      
      {/* Stok Ekleme Formu */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Yeni Stok Öğesi Ekle</h2>
          <Button 
            onClick={() => setShowStockForm(!showStockForm)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {showStockForm ? 'Formu Gizle' : 'Stok Ekleme Formunu Göster'}
          </Button>
        </div>
        
        {showStockForm && (
          <AddStockForm 
            onAddStock={handleAddStock} 
            onBulkUpload={handleBulkUpload} 
          />
        )}
      </Card>

      {/* Müşteri/Tedarikçi Ekleme Formu */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Yeni Müşteri/Tedarikçi Ekle</h2>
          <Button 
            onClick={() => setShowCustomerForm(!showCustomerForm)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {showCustomerForm ? 'Formu Gizle' : 'Müşteri/Tedarikçi Formu Göster'}
          </Button>
        </div>
        
        {showCustomerForm && (
          <AddCustomerForm onAddCustomer={handleAddCustomer} />
        )}
      </Card>

      {/* Fatura Ekleme Formu */}
      <Card className="mb-6">
        <InvoiceForm 
          customers={customers}
          showForm={showInvoiceForm}
          onToggleForm={() => setShowInvoiceForm(!showInvoiceForm)}
          onAddInvoice={handleAddInvoice}
        />
      </Card>
      
      {/* Stok Tablosu */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stok Listesi</h2>
          <Button 
            onClick={toggleStockTable}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {showStockTable ? 'Listeyi Gizle' : 'Stok Listesini Göster'}
          </Button>
        </div>
        
        {showStockTable && (
          <StockTable 
            data={data}
            loading={loading}
            totalCount={totalCount}
            onFetchData={fetchStocks}
            onGenerateQrCode={handleQrCodeGeneration}
          />
        )}
      </Card>
    </div>
  );
};

export default StockPage;
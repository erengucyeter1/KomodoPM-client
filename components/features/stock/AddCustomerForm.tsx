import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface CustomerFormProps {
  onAddCustomer: (customerData: any) => Promise<void>;
}

const AddCustomerForm: React.FC<CustomerFormProps> = ({ onAddCustomer }) => {
  const [customer, setCustomer] = useState({
    title: '',
    taxOffice: '',
    taxNumber: '',
    address: '',
    countryCode: 'TR',
    phone: '',
    email: '',
    type: 'customer' // customer veya supplier
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // API'ye göndermeden önce isSupplier alanını uygun şekilde ayarla
    const customerData = {
      ...customer,
      isSupplier: customer.type === 'supplier'
    };
    
    // type alanını API'ye göndermeye gerek olmadığı için kaldırıyoruz
    delete customerData.type;
    
    await onAddCustomer(customerData);
    
    // Formu temizle
    setCustomer({
      title: '',
      taxOffice: '',
      taxNumber: '',
      address: '',
      countryCode: 'TR',
      phone: '',
      email: '',
      type: 'customer'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Unvan</label>
          <input
            type="text"
            name="title"
            value={customer.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Vergi Dairesi</label>
          <input
            type="text"
            name="taxOffice"
            value={customer.taxOffice}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Vergi/TC Kimlik No</label>
          <input
            type="text"
            name="taxNumber"
            value={customer.taxNumber}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-gray-700 text-sm font-bold mb-2">Adres</label>
          <textarea
            name="address"
            value={customer.address}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Ülke Kodu</label>
          <input
            type="text"
            name="countryCode"
            value={customer.countryCode}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            maxLength={2}
            placeholder="TR"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Telefon</label>
          <input
            type="tel"
            name="phone"
            value={customer.phone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="05XX XXX XX XX"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">E-posta</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Kayıt Tipi</label>
          <select
            name="type"
            value={customer.type}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="customer">Müşteri</option>
            <option value="supplier">Tedarikçi</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit"
          className="bg-green-500 hover:bg-green-600"
        >
          Kaydet
        </Button>
      </div>
    </form>
  );
};

export default AddCustomerForm;
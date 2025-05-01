import { useState } from 'react';

export default function PermissionRequestForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    projectNumber: '',
    expenseNumber: '',
    oldAmount: '',
    newAmount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      oldAmount: parseFloat(formData.oldAmount),
      newAmount: parseFloat(formData.newAmount)
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-md p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Değişiklik Talebi</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Proje Numarası</label>
          <input
            type="text"
            name="projectNumber"
            value={formData.projectNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Gider Numarası</label>
          <input
            type="text"
            name="expenseNumber"
            value={formData.expenseNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Eski Miktar</label>
          <input
            type="number"
            name="oldAmount"
            value={formData.oldAmount}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Yeni Miktar</label>
          <input
            type="number"
            name="newAmount"
            value={formData.newAmount}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  );
}
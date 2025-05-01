"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axiosInstance from "@/utils/axios";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import { FiPlus, FiTrash2, FiEdit, FiX } from "react-icons/fi";
import TreylerForm from "./TreylerForm";

interface Treyler {
  id: string | number;
  name: string;
  description?: string;
  image_data?: string;
  image_content_type?: string;
  created_at: string;
}

export default function TreylersPage() {
  const [treylers, setTreylers] = useState<Treyler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentTreyler, setCurrentTreyler] = useState<Treyler | null>(null);

  // Fetch treylers on initial load
  useEffect(() => {
    fetchTreylers();
  }, []);

  const fetchTreylers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get('/treylers');
      setTreylers(response.data);
    } catch (err) {
      console.error("Error fetching treylers:", err);
      setError("Treyler listesi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTreyler = async (id: string | number) => {
    if (!confirm('Bu treyleri silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/treylers/${id}`);
      // Remove from state without refetching
      setTreylers(treylers.filter(t => t.id !== id));
    } catch (err) {
      console.error("Error deleting treyler:", err);
      setError("Treyler silinirken bir hata oluştu.");
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (currentTreyler) {
        // Update existing treyler
        await axiosInstance.patch(`/treylers/${currentTreyler.id}`, formData);
      } else {
        // Create new treyler
        await axiosInstance.post('/treylers', formData);
      }
      
      // Refresh the list and close form
      await fetchTreylers();
      setShowForm(false);
      setCurrentTreyler(null);
    } catch (err) {
      console.error("Error saving treyler:", err);
      return { error: "Treyler kaydedilirken bir hata oluştu." };
    }
  };

  const openEditForm = (treyler: Treyler) => {
    setCurrentTreyler(treyler);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card 
        title="Treyler Modelleri" 
        actions={
          <Button 
            startIcon={<FiPlus />}
            onClick={() => {
              setCurrentTreyler(null);
              setShowForm(true);
            }}
          >
            Yeni Treyler
          </Button>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading text="Treylerler yükleniyor..." />
          </div>
        ) : treylers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">🚚</div>
            <p className="text-xl font-medium mb-2">Henüz treyler bulunmuyor</p>
            <p>Yeni bir treyler eklemek için "Yeni Treyler" butonuna tıklayın.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {treylers.map((treyler) => (
              <div key={treyler.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {treyler.image_data ? (
                    <Image 
                      src={`data:${treyler.image_content_type || 'image/jpeg'};base64,${treyler.image_data}`}
                      alt={treyler.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span>Görsel yok</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg">{treyler.name}</h3>
                  {treyler.description && (
                    <p className="text-gray-600 mt-1 line-clamp-2">{treyler.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      {new Date(treyler.created_at).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditForm(treyler)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTreyler(treyler.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Treyler Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">
                {currentTreyler ? 'Treyler Düzenle' : 'Yeni Treyler Ekle'}
              </h2>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setCurrentTreyler(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <TreylerForm 
                initialData={currentTreyler} 
                onSubmit={handleFormSubmit} 
                onCancel={() => {
                  setShowForm(false);
                  setCurrentTreyler(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
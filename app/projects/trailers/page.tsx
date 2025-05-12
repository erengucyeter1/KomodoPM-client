"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axiosInstance from "@/utils/axios";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import { FiPlus, FiTrash2, FiEdit, FiX } from "react-icons/fi";
import TrailerForm from  "./TrailerForm";

interface Trailer {
  id: string | number;
  name: string;
  description?: string;
  image_data?: string;
  image_content_type?: string;
  created_at: string;
}

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<Trailer | null>(null);

  // Fetch Trailer on initial load
  useEffect(() => {
    fetchTrailers();
  }, []);

  const fetchTrailers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get('/trailers');
      setTrailers(response.data);
    } catch (err) {
      console.error("Error fetching trailers:", err);
      setError("Römork listesi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrailer= async (id: string | number) => {
    if (!confirm('Bu römorku silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/trailers/${id}`);
      // Remove from state without refetching
      setTrailers(trailers.filter(t => t.id !== id));
    } catch (err) {
      setError("Römork silinirken bir hata oluştu.");
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (currentTrailer) {
        // Update existing Trailer
        await axiosInstance.patch(`/trailers/${currentTrailer.id}`, formData);
      } else {
        // Create new trailer
        await axiosInstance.post('/trailers', formData);
      }
      
      // Refresh the list and close form
      await fetchTrailers();
      setShowForm(false);
      setCurrentTrailer(null);
    } catch (err) {
      console.error("Römork kaydedilirken bir hata oluştu:", err);
      return { error: "Römork kaydedilirken bir hata oluştu." };
    }
  };

  const openEditForm = (trailer: Trailer) => {
    setCurrentTrailer(trailer);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <Card 
        title="Römork Modelleri" 
        actions={
          <Button 
            startIcon={<FiPlus />}
            onClick={() => {
              setCurrentTrailer(null);
              setShowForm(true);
            }}
          >
            Yeni Römork
          </Button>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading text="Römorklar yükleniyor..." />
          </div>
        ) : trailers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">🚚</div>
            <p className="text-xl font-medium mb-2">Henüz römork bulunmuyor!</p>
            <p>Yeni bir römork eklemek için "Yeni Römork" butonuna tıklayın.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {trailers.map((trailer) => (
              <div key={trailer.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {trailer.image_data ? (
                    <Image 
                      src={`data:${trailer.image_content_type || 'image/jpeg'};base64,${trailer.image_data}`}
                      alt={trailer.name}
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
                  <h3 className="font-bold text-lg">{trailer.name}</h3>
                  {trailer.description && (
                    <p className="text-gray-600 mt-1 line-clamp-2">{trailer.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      {new Date(trailer.created_at).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditForm(trailer)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrailer(trailer.id)}
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

      {/* Trailer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">
                {currentTrailer ? 'Römork Düzenle' : 'Yeni Römork Ekle'}
              </h2>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setCurrentTrailer(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <TrailerForm 
                initialData={currentTrailer} 
                onSubmit={handleFormSubmit} 
                onCancel={() => {
                  setShowForm(false);
                  setCurrentTrailer(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
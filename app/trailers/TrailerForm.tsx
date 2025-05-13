"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";

interface TrailerFormProps {
  initialData?: any;
  onSubmit: (formData: any) => Promise<{error?: string} | void>;
  onCancel: () => void;
}

export default function TrailerForm({ initialData, onSubmit, onCancel }: TrailerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageData: "",
    contentType: "image/jpeg"
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        imageData: "",
        contentType: initialData.image_content_type || "image/jpeg"
      });
      
      // If there's an existing image, show it in the preview
      if (initialData.image_data) {
        setImagePreview(`data:${initialData.image_content_type || 'image/jpeg'};base64,${initialData.image_data}`);
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 1MB)
    if (file.size > 1 * 1024 * 1024) {
      setError("Dosya boyutu 1MB'dan küçük olmalıdır.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract the base64 data part
      const base64Data = result.split(',')[1];
      
      setFormData(prev => ({
        ...prev,
        imageData: base64Data,
        contentType: file.type
      }));
      
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name.trim()) {
      setError("Lütfen bir römork adı girin.");
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit(formData);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="error" message={error} />}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Römork Adı
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]"
          placeholder="Römork adını giriniz"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Açıklama
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]"
          placeholder="Römork açıklaması giriniz"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Römork Görseli
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#063554] file:text-white hover:file:bg-[#052a43]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Maksimum dosya boyutu: 2MB. Önerilen görüntü boyutu: 800x600 piksel.
        </p>
      </div>

      {imagePreview && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Görsel Önizleme</label>
          <div className="relative h-48 bg-gray-100 rounded border">
            <img 
              src={imagePreview} 
              alt="Römork önizleme" 
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Ekle"}
        </Button>
      </div>
    </form>
  );
}
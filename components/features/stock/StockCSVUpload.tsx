import React, { useState } from 'react';
import axios from 'axios';
import { Button, Upload, message, Progress } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';

interface StockItem {
  stock_code: string;
  name: string; 
  unit: string;
}

const StockCSVUpload: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processCSV = (file: File) => {
    setLoading(true);
    setProgress(10);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setProgress(30);
          
          // İlk satırı başlık olarak varsayıyoruz
          const data = results.data.slice(1) as string[][];
          
          const stockItems: StockItem[] = data.map((row: string[]) => {
            const [stock_code, name, unit] = row[0].split(';');
            return {
              stock_code,
              name,
              unit
            };
          });

          setProgress(50);
          
          if (stockItems.length === 0) {
            message.error('CSV dosyasında geçerli veri bulunamadı!');
            setLoading(false);
            return;
          }

          // Bulk API'ye gönder
          const response = await axios.post('/api/stock/bulk', stockItems);
          
          setProgress(100);
          message.success(`${response.data.length} adet stok başarıyla eklendi!`);
          onSuccess(); // Stok tablosunu güncellemek için callback
        } catch (error) {
          console.error('CSV işleme hatası:', error);
          message.error('Stok ekleme sırasında bir hata oluştu!');
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        message.error(`CSV okuma hatası: ${error.message}`);
        setLoading(false);
      }
    });
  };

  const props = {
    name: 'file',
    accept: '.csv',
    beforeUpload: (file: File) => {
      const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');
      if (!isCsv) {
        message.error('Lütfen sadece CSV dosyası yükleyin!');
        return false;
      }
      processCSV(file);
      return false; // Upload bileşeninin dosyayı otomatik yüklemesini engelle
    },
    showUploadList: false,
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Upload {...props}>
        <Button icon={<UploadOutlined />} loading={loading}>
          CSV İle Stok Yükle
        </Button>
      </Upload>
      
      {loading && <Progress percent={progress} status="active" style={{ marginTop: 8 }} />}
      
      <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
        CSV formatı: STKKOD;STKCINSI;STKBIRIM
      </div>
    </div>
  );
};

export default StockCSVUpload;
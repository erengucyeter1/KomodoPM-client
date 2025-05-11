"use client";

import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, Scan } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axiosInstance from "@/utils/axios";

export default function NewExpensePage() {
  const [stockCode, setStockCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("ADET");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const params = useParams();
  const projectId = params.id;


  const [stockInfo, setStockInfo] = useState(null);
  const [stockInfoErr, setStockInfoErr] = useState(null);

  const units = [
    "ADET",
    "KİLO",
    "METRE",
    "SET",
    "METREKÜP",
    "TAKIM",
    "TON",
    "PAKET"
  ];

  const startScanner = () => {
    setIsScanning(true);
    setScanError("");
    setScanStatus("Kamera başlatılıyor...");
  };

  const stopScanner = () => {
  if (scannerRef.current) {
    scannerRef.current
      .stop()
      .then(() => {
        setIsScanning(false);
        setScanStatus("");
        scannerRef.current = null; // Scanner instance'ı temizle
      })
      .catch(error => {
        console.error("Error stopping scanner:", error);
        setScanError("Kamera kapatılırken hata oluştu");
      });
  } else {
    setIsScanning(false);
    setScanStatus("");
  }
};

  // Initialize scanner after DOM is ready
  useEffect(() => {
    if (isScanning) {
      // Brief timeout to ensure DOM is ready
      const initializeScanner = setTimeout(() => {
        try {
          const qrContainer = document.getElementById("qr-reader");
          
          if (!qrContainer) {
            setScanError("Tarayıcı bileşeni bulunamadı");
            setIsScanning(false);
            return;
          }
          
          setScanStatus("Kamera erişimi isteniyor...");
          
          // First, get available devices
          Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
              const html5QrCode = new Html5Qrcode("qr-reader");
              scannerRef.current = html5QrCode;
              
              // Use the last camera (usually the back camera on phones)
              const cameraId = devices[devices.length - 1].id;
              
              setScanStatus("Kamera başlatıldı, QR kod aranıyor...");
              
              html5QrCode.start(
                cameraId,
                {
                  fps: 10,
                  qrbox: undefined, // Let scanner determine optimal size
                },
                (decodedText) => {
                  // QR code successfully scanned
                  
                  const parts = decodedText.split(";");
                  if (parts.length !== 2) {
                    setScanError("Geçersiz QR kod formatı");
                    return;
                  }
                  const [code, mesurement] = parts;

                  setStockCode(code);
                  setUnit(mesurement);
                  setScanResult(decodedText);
                  setScanStatus("QR kod başarıyla tarandı!");
                  stopScanner();
                },
                (errorMessage) => {
                  // Only show major errors in UI, not scanning attempts
                  if (errorMessage.includes("No QR code found")) {
                    // Silent error - just scanning
                    return;
                  }
                  console.log(`QR scan error: ${errorMessage}`);
                }
              ).catch((err) => {
                setScanError(`Kamera erişimi reddedildi veya cihaz desteklenmiyor: ${err.message}`);
                setIsScanning(false);
                console.error("Error starting scanner:", err);
              });
            } else {
              setScanError("Hiçbir kamera cihazı bulunamadı");
              setIsScanning(false);
            }
          }).catch(err => {
            setScanError("Kamera listesi alınamadı");
            setIsScanning(false);
            console.error("Error getting cameras:", err);
          });
          
        } catch (err) {
          setScanError("Tarayıcı başlatılırken hata oluştu");
          setIsScanning(false);
          console.error("Scanner initialization error:", err);
        }
      }, 500); // Increased timeout for DOM readiness
      
      return () => clearTimeout(initializeScanner);
    }
  }, [isScanning]);

  useEffect(() => {
  return () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
    }
  };
}, []);


 useEffect(() => {
  if (!stockCode) {
    return;
  }

  axiosInstance
    .get(`/stock/${stockCode}`)
    .then((response) => {
      // Stok bilgilerini burada kullanabilirsin
      setStockInfo(response.data);
      setStockInfoErr(null);
      setUnit(response.data.measurement_unit);

    })
    .catch((error) => {
      setStockInfoErr("Hatalı stok kodu veya stok bulunamadı");
      setStockInfo(null);
    });
}, [stockCode]);




  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-5">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href={`/projects/${projectId}`} className="mr-2">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Yeni Gider Ekle</h1>
        </div>

        {/* Stock Code Input */}
        <div className="mb-6">
          <label htmlFor="stockCode" className="block text-sm font-medium text-gray-700 mb-1">
            Stok Kodu
          </label>
          <div className="flex">
            <input
              type="text"
              id="stockCode"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Stok kodunu girin veya QR okutun"
            />
            <button
              onClick={isScanning ? stopScanner : startScanner}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-r-md flex items-center"
            >
              <Scan size={20} />
              <span className="ml-1">{isScanning ? "Durdur" : "Tara"}</span>
            </button>
          </div>
          {scanResult && <p className="text-sm text-green-600 mt-1">Tarama başarılı!</p>}
          {scanError && <p className="text-sm text-red-600 mt-1">{scanError}</p>}
          {scanStatus && !scanError && <p className="text-sm text-blue-600 mt-1">{scanStatus}</p>}
        </div>

        {stockInfo&& stockCode && (
          <div>
          <div className="flex items-center mb-2">
              <p className = "text-l text-green-500">Kullanılabilir miktar: {stockInfo?.balance} {stockInfo?.measurement_unit}</p>

            </div>
        </div>
        )}

        {stockInfoErr && (
          <div className="flex items-center mb-2">
            <p className="text-sm text-red-600 mt-1">{stockInfoErr}</p>
          </div>
        )}



        {/* QR Scanner */}
        {isScanning && (
          <div className="mb-6">
            <div id="qr-reader" className="w-full" style={{ height: "300px" }}></div>
            <p className="text-sm text-gray-500 mt-2">
              Lütfen QR kodu kameranın görüş alanına getirin
            </p>
          </div>
        )}

        {/* Quantity and Unit Fields - Only show after a stock code is entered/scanned */}
        {stockInfo && stockCode && (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Miktar
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => {
                      const max = Number(stockInfo?.balance || 0);
                      let val = Number(e.target.value);
                      if (val > max) val = max;
                      if (val < 0) val = 0;
                      setQuantity(val.toString());
                    }}                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Miktarı girin"
                  min="0"
                  max= {stockInfo?.balance || "0"}
                  step="any"
                  required
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Ölçü Birimi
                </label>
                <select
                  id="unit"
                  value={unit}
                  readOnly
                  //onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  {units.map((unitOption) => (
                    <option key={unitOption} value={unitOption}>
                      {unitOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        

        {/* Add Expense Button (non-functional for now) */}
        <button 
          className={`w-full ${stockCode && quantity ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-3 px-4 rounded-md shadow-sm`}
          disabled={!stockCode || !quantity}
        >
          Gider Ekle
        </button>
      </div>
    </div>
  );
}
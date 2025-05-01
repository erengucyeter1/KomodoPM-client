"use client";

import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, Scan } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewExpensePage() {
  const [stockCode, setStockCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const params = useParams();
  const projectId = params.id;

  const startScanner = () => {
    setIsScanning(true);
    setScanError("");
    setScanStatus("Kamera başlatılıyor...");
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
          setScanStatus("");
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
                  setStockCode(decodedText);
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
      // Cleanup function to ensure scanner is stopped when component unmounts
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-5">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href={`/dashboard/projects/${projectId}`} className="mr-2">
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
          {scanResult && <p className="text-sm text-green-600 mt-1">Tarama başarılı: {scanResult}</p>}
          {scanError && <p className="text-sm text-red-600 mt-1">{scanError}</p>}
          {scanStatus && !scanError && <p className="text-sm text-blue-600 mt-1">{scanStatus}</p>}
        </div>

        {/* QR Scanner */}
        {isScanning && (
          <div className="mb-6">
            <div id="qr-reader" className="w-full" style={{ height: "300px" }}></div>
            <p className="text-sm text-gray-500 mt-2">
              Lütfen QR kodu kameranın görüş alanına getirin
            </p>
          </div>
        )}

        {/* Add Expense Button (non-functional for now) */}
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md shadow-sm"
        >
          Gider Ekle
        </button>
      </div>
    </div>
  );
}
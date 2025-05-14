import { useRef, useState } from "react";
import  axios from "@/utils/axios";
import Papa from 'papaparse';
import { withPermissions } from "@/hoc/withPermissions";


export default withPermissions(NewStockForm, ["create:stock"]);

function NewStockForm() {

  



  



    return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      

        <h2 className="text-xl font-semibold mb-4">Yeni Stok Öğesi Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stockCode">
                Stok Kodu
              </label>
              <input
                id="stockCode"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="measurementUnit">
                Ölçüm Birimi
              </label>
              <select
                id="measurementUnit"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
                required
              >
                {['ADET', 'KİLO', 'METRE', 'SET', 'METREKÜP', 'TAKIM', 'TON', 'PAKET'].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Açıklama
              </label>
              <input
                id="description"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                CSV İle Toplu Yükleme
              </label>
              <div className="flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-file"
                  onChange={handleCsvUpload}
                  disabled={uploadingCsv}
                />
                <label 
                  htmlFor="csv-file"
                  className={`cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ${uploadingCsv ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M13 10v6H7v-6H2l8-8 8 8h-5zM0 18h20v2H0v-2z"/>
                  </svg>
                  <span>CSV Dosyası Seç</span>
                </label>
                <span className="ml-3 text-sm text-gray-600">
                  Format: STKKOD;STKCINSI;STKBIRIM
                </span>
              </div>
              {uploadingCsv && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    )
}

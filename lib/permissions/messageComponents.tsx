
import React from 'react';

export function forbiddenWarning() {
    return (
      <div className="bg-red-500 text-white p-4 rounded-md mb-4">
        <strong>Uyarı:</strong> Bu sayfaya erişim yetkiniz yok.
      </div>
    );
  }
// client/types/index.ts (veya uygun bir yol)
export interface User {
    id: string |number; // Kullanıcı ID'si
    username: string;    // Kullanıcı adı
    name?: string;        // Gerçek adı (opsiyonel olabilir)
    surname?: string;
    email?: string;       // E-posta (opsiyonel olabilir)
    permissions?: string[]; // İzinler (string dizisi olarak)
    roles?: number[];
    authorization_ids?: (string | number)[]; // Yetki ID'leri (eski sistemle uyumluluk için)
    authorization_rank: number;
  }
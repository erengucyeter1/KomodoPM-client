import "./globals.css";
import { AuthProvider } from "@/hooks/useAuthProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";


export const metadata = {
  title: "Komodo Project Management",
  description: "Komodo Project Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider >
          <DashboardLayout>{children}</DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
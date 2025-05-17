import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
// import DashboardLayout from "@/components/layout/DashboardLayout"; // No longer directly used here
import ConditionalLayout from "@/components/layout/ConditionalLayout"; // Import the new layout chooser
import SocketAuthWrapper from "@/context/socketAuthWrapper";

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
              <SocketAuthWrapper>
                    {/* <DashboardLayout> */}
                    <ConditionalLayout> 
                    {children}
                    {/* </DashboardLayout> */}
                    </ConditionalLayout>
              </SocketAuthWrapper>
      </AuthProvider>

      </body>
    </html>
  );
}



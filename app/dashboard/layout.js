import Header from "@/components/layout/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      {children}
    </div>
  );
}
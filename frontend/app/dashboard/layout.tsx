import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/global/sidebar";
import { Navbar } from "@/components/global/navbar";
import { DashboardAuthGuard } from "@/components/global/dashboard-auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGuard>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex min-h-screen">
          <Sidebar />

          {/* Main area */}
          <div className="flex flex-1 flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>

          <Toaster />
        </div>
      </ThemeProvider>
    </DashboardAuthGuard>
  );
}

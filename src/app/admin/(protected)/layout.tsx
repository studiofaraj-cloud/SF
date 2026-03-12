
import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { AuthGuard } from '@/components/admin/auth-guard';

/**
 * Protected admin layout — sidebar + header + auth guard.
 * All pages inside (protected)/ get this layout on top of the root admin layout.
 */
export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <main
            id="main-content"
            className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gradient-to-br from-background via-background to-secondary/20 min-h-screen"
          >
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}

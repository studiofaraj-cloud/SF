'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { CircleUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser } from '@/firebase/provider';
import Link from 'next/link';

export function AdminHeader() {
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const userName = user?.displayName || user?.email || 'Mio Account';

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Menu utente: {userName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">Impostazioni</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Supporto</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

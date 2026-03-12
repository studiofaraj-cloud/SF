
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
import { logout } from '@/lib/actions';
import Link from 'next/link';

type UserSession = {
  name: string;
}

type HeaderProps = {
  user?: UserSession | null;
};

export function AdminHeader({ user }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logout}>
            <button type="submit" className="w-full">
                <DropdownMenuItem>Logout</DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin',             label: 'Overview',     icon: LayoutDashboard, exact: true },
  { href: '/admin/blogs',       label: 'Blogs',        icon: FileText },
  { href: '/admin/projects',    label: 'Projects',     icon: FolderKanban },
  { href: '/admin/messages',    label: 'Messages',     icon: MessageSquare },
  { href: '/admin/subscribers', label: 'Subscribers',  icon: Users },
  { href: '/admin/bookings',    label: 'Bookings',     icon: Calendar },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/') || pathname.startsWith(href.replace('/admin', '/admin'));

  return (
    <Sidebar className="border-r-0 bg-[#0a0a0f]">
      {/* ── Logo ── */}
      <SidebarHeader className="px-4 py-5 border-b border-white/5">
        <Link
          href="/admin"
          className="flex items-center gap-3 group"
          aria-label="Studio Faraj Admin"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
            <Image src="/assets/logo.png" alt="" width={18} height={18} aria-hidden="true" unoptimized />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Studio Faraj</p>
            <p className="text-[10px] text-white/30 mt-0.5 font-mono tracking-widest uppercase">Admin</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent className="px-3 py-4">
        {/* section label */}
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 px-3 mb-2">
          Navigation
        </p>

        <nav className="flex flex-col gap-0.5">
          {menuItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                )}
              >
                {/* active left bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
                )}

                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    active ? 'text-primary' : 'text-white/30 group-hover:text-white/60'
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>

                {/* hover arrow */}
                {!active && (
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3 text-white/20" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* divider */}
        <div className="my-4 h-px bg-white/5" />

        {/* View site link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-white/25 hover:text-white/50 hover:bg-white/5 transition-all group"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span>View Website</span>
        </a>
      </SidebarContent>

      {/* ── Footer / Settings ── */}
      <SidebarFooter className="px-3 py-4 border-t border-white/5">
        <Link
          href="/admin/settings"
          aria-current={pathname === '/admin/settings' ? 'page' : undefined}
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            pathname === '/admin/settings'
              ? 'bg-primary/15 text-primary'
              : 'text-white/40 hover:text-white/80 hover:bg-white/5'
          )}
        >
          <Settings
            className={cn(
              'h-4 w-4 shrink-0',
              pathname === '/admin/settings' ? 'text-primary' : 'text-white/30 group-hover:text-white/60'
            )}
            aria-hidden="true"
          />
          <span>Settings</span>
        </Link>

        {/* user indicator */}
        <div className="mt-3 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
          <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">A</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/60 truncate">Admin</p>
            <p className="text-[10px] text-white/25 truncate">studiofaraj.it</p>
          </div>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" title="Online" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

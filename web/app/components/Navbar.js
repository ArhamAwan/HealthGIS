'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Calendar, User, Users, Building2, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const patientLinks = [
  { href: '/home', label: 'Home', icon: Map },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { href: '/doctors', label: 'Doctors', icon: Users },
  { href: '/hospitals', label: 'Hospitals', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : patientLinks;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-8 gap-3 z-50 border-r border-[var(--border)] bg-[var(--card)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center mb-8">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative w-full flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors group"
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-y-0 left-2 right-2 rounded-2xl bg-[var(--primary-light)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={`relative z-10 transition-colors ${
                  active
                    ? 'text-[var(--primary)]'
                    : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-semibold ${
                  active ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop app name pill (outside navbar) - only on home */}
      {pathname.startsWith('/home') && (
        <div className="hidden lg:flex fixed left-28 top-6 z-40">
          <div className="px-5 py-2 rounded-full glass border border-[var(--primary)] bg-[var(--primary-light)]/80 shadow-md">
            <span className="text-sm font-extrabold tracking-wide text-[var(--primary)] uppercase">
              Healthcare&nbsp;GIS
            </span>
          </div>
        </div>
      )}

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--card)]/98 backdrop-blur">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="relative flex flex-col items-center gap-0.5 py-1 px-4">
                {active && (
                  <motion.div layoutId="nav-active-mobile" className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[var(--primary)]" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <Icon size={20} className={active ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'} />
                <span className={`text-[10px] font-semibold ${active ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

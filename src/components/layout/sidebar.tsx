'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  GraduationCap,
  Clock,
  Bookmark,
  Award,
  Heart,
  Target
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SidebarProps {
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    {
      title: 'Principal',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/dashboard/courses', label: 'Mes Cours', icon: BookOpen },
        { href: '/dashboard/progress', label: 'Progression', icon: BarChart3 },
        { href: '/dashboard/saved', label: 'Favoris', icon: Bookmark },
      ],
    },
    {
      title: 'Apprentissage',
      items: [
        { href: '/dashboard/current', label: 'En cours', icon: Clock },
        { href: '/dashboard/completed', label: 'Terminés', icon: GraduationCap },
        { href: '/dashboard/achievements', label: 'Réussites', icon: Trophy },
      ],
    },
    {
      title: 'Compte',
      items: [
        { href: '/dashboard/profile', label: 'Profil', icon: User },
        { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
      ],
    },
  ];

  // Si instructeur, ajouter section instructeur
  if (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') {
    navItems.push({
      title: 'Instructeur',
      items: [
        { href: '/instructor/courses', label: 'Mes cours', icon: BookOpen },
        { href: '/courses/create', label: 'Créer un cours', icon: Target },
      ],
    });
  }

  // Si admin, ajouter section admin
  if (user?.role === 'ADMIN') {
    navItems.push({
      title: 'Administration',
      items: [
        { href: '/admin', label: 'Dashboard', icon: BarChart3 },
        { href: '/admin/users', label: 'Utilisateurs', icon: User },
        { href: '/admin/courses', label: 'Cours', icon: BookOpen },
        { href: '/admin/settings', label: 'Paramètres', icon: Settings },
      ],
    });
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300 h-full',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Button */}
      <div className="flex items-center justify-end p-4 border-b">
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground',
                      isCollapsed && 'justify-center'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
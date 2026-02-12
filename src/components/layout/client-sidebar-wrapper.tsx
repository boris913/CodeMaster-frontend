'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sidebar } from './sidebar';

export function ClientSidebarWrapper() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Afficher la sidebar uniquement sur les routes du dashboard, instructor, admin
  const showSidebar = pathname?.startsWith('/dashboard') || 
                      pathname?.startsWith('/instructor') || 
                      pathname?.startsWith('/admin') ||
                      pathname?.startsWith('/my-courses');

  if (!showSidebar) return null;

  return (
    <Sidebar 
      isCollapsed={isCollapsed} 
      onCollapse={() => setIsCollapsed(!isCollapsed)} 
    />
  );
}
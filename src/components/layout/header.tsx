'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Moon,
  Sun,
  Menu,
  X,
  Bell,
  Search,
  BookOpen,
  Home,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  Users,
  BarChart3,
  PlusCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Ne pas afficher le header sur les pages d'authentification
  if (pathname?.startsWith('/login') || 
      pathname?.startsWith('/register') || 
      pathname?.startsWith('/forgot-password') || 
      pathname?.startsWith('/reset-password')) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { href: '/', label: 'Accueil', icon: <Home className="w-4 h-4" /> },
    { href: '/courses', label: 'Cours', icon: <BookOpen className="w-4 h-4" /> },
    { href: '/community', label: 'Communauté', icon: <Users className="w-4 h-4" /> },
  ];

  if (isAuthenticated) {
    navItems.push({ href: '/my-courses', label: 'Mes cours', icon: <GraduationCap className="w-4 h-4" /> });
    navItems.push({ href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">CM</span>
              </div>
              <span className="font-heading text-xl font-bold text-primary">
                CodeMaster
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="rounded-full relative" asChild>
                <Link href="/dashboard/notifications">
                  <Bell className="h-5 w-5" />
                  {/* <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"></span> */}
                </Link>
              </Button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.username} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.username?.slice(0, 2).toUpperCase() || 'US'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden lg:inline">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-courses">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Mes cours
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  
                  {user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Instructeur</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/instructor/courses">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Mes cours
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/courses/create">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Créer un cours
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : null}

                  {user?.role === 'ADMIN' ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Administration</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Dashboard Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users">
                          <Users className="mr-2 h-4 w-4" />
                          Utilisateurs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/courses">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Cours
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Paramètres
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : null}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user?.username}</span>
                    </div>
                    <Link href="/dashboard/profile" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Button>
                    </Link>
                    <Link href="/dashboard/settings" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button className="w-full">S'inscrire</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
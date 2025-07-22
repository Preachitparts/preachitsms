
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquareText, LayoutDashboard, History, LogOut, Users, Folder, Settings, Moon, Sun, Menu, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { logout, getCurrentUser, Admin } from '@/app/auth/actions';


export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const isMobile = useIsMobile();
  const [user, setUser] = React.useState<Admin | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        // This can happen if the cookie is stale or invalid.
        // Redirecting to login will clear the cookie via middleware if needed.
        router.push('/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await logout();
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/history':
        return 'History';
      case '/members':
        return 'Members';
      case '/groups':
        return 'Groups';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const sidebarContent = (
    <>
       <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MessageSquareText className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold font-headline">Preach It SMS</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'}>
                <Link href="/">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/history'}>
                <Link href="/history">
                  <History />
                  History
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/members'}>
                  <Link href="/members">
                    <Users />
                    Members
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/groups'}>
                  <Link href="/groups">
                    <Folder />
                    Groups
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.canSeeSettings && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                    <Link href="/settings">
                      <Settings />
                      Settings
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {loading ? (
            <div className="flex items-center gap-2 p-2">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                <div className="hidden group-data-[state=expanded]:flex flex-col gap-1 w-32">
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse"></div>
                  <div className="h-3 w-3/4 rounded-md bg-muted animate-pulse"></div>
                </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex w-full items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.fullName || ''} data-ai-hint="user avatar" />
                    <AvatarFallback>{user?.fullName ? getInitials(user.fullName) : 'AD'}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left group-data-[state=expanded]:block">
                    <p className="text-sm font-medium truncate">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarFooter>
    </>
  )

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
         <Sidebar>
            {sidebarContent}
         </Sidebar>
        <div className="flex flex-col w-full">
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 sticky top-0 z-30">
                 {isMobile && (
                     <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                            <Sidebar isSheet>
                                {sidebarContent}
                            </Sidebar>
                        </SheetContent>
                    </Sheet>
                )}
                <h2 className="text-xl font-headline font-semibold flex-1">
                    {getPageTitle()}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

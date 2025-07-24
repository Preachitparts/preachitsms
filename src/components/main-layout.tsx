
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageSquareText, LayoutDashboard, History, Users, Folder, Settings, Moon, Sun, Menu, MessageSquarePlus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeContext } from './theme-provider';
import { cn } from '@/lib/utils';


export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const isMobile = useIsMobile();
  const themeContext = React.useContext(ThemeContext);

  if (!themeContext) {
    // This can happen on first render before context is available.
    // You can return a loader or null
    return null; 
  }

  const { sidebarPosition } = themeContext;

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/bulk-sms':
        return 'Bulk SMS';
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
              <SidebarMenuButton asChild isActive={pathname === '/bulk-sms'}>
                <Link href="/bulk-sms">
                  <MessageSquarePlus />
                  Bulk SMS
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                  <Link href="/settings">
                    <Settings />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* User profile section removed */}
        </SidebarFooter>
    </>
  )

  const MainContent = (
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
                            <SheetHeader className="p-4">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            </SheetHeader>
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
  )

  return (
    <SidebarProvider>
      <div className={cn(
          "flex min-h-screen",
          sidebarPosition === 'right' && 'flex-row-reverse'
        )}>
         <Sidebar>
            {sidebarContent}
         </Sidebar>
         {MainContent}
      </div>
    </SidebarProvider>
  );
}

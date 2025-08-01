
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

const FONT_FAMILIES: Record<string, string> = {
    inter: 'Inter',
    space_grotesk: 'Space Grotesk',
    roboto: 'Roboto',
    lato: 'Lato',
    montserrat: 'Montserrat',
    oswald: 'Oswald',
};

const FONT_URLS: Record<string, string> = {
    inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
    space_grotesk: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap',
    roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    lato: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
    montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap',
    oswald: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&display=swap',
};

type CustomThemeProviderProps = ThemeProviderProps & {
    children: React.ReactNode;
};

type MobileSidebarPosition = 'left' | 'right' | 'top' | 'bottom';

export const ThemeContext = React.createContext<{
    sidebarPosition: 'left' | 'right';
    setSidebarPosition: (pos: 'left' | 'right') => void;
    mobileSidebarPosition: MobileSidebarPosition;
    setMobileSidebarPosition: (pos: MobileSidebarPosition) => void;
} | null>(null);


export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  const [bodyFont, setBodyFont] = React.useState('inter');
  const [headlineFont, setHeadlineFont] = React.useState('space_grotesk');
  const [sidebarPosition, setSidebarPosition] = React.useState<'left' | 'right'>('left');
  const [mobileSidebarPosition, setMobileSidebarPosition] = React.useState<MobileSidebarPosition>('left');


  React.useEffect(() => {
    const handleThemeChange = () => {
        const storedBodyFont = localStorage.getItem('theme-font-body') || 'inter';
        const storedHeadlineFont = localStorage.getItem('theme-font-headline') || 'space_grotesk';
        const storedFontSize = localStorage.getItem('theme-font-size') || '16';
        const storedFgColor = localStorage.getItem('theme-color-foreground');
        const storedSidebarPos = localStorage.getItem('theme-sidebar-position') as 'left' | 'right' || 'left';
        const storedMobileSidebarPos = localStorage.getItem('theme-mobile-sidebar-position') as MobileSidebarPosition || 'left';

        setBodyFont(storedBodyFont);
        setHeadlineFont(storedHeadlineFont);
        setSidebarPosition(storedSidebarPos);
        setMobileSidebarPosition(storedMobileSidebarPos);
        
        document.documentElement.style.setProperty('--font-size-base', `${storedFontSize}px`);
        
        const bodyFontName = FONT_FAMILIES[storedBodyFont];
        const headlineFontName = FONT_FAMILIES[storedHeadlineFont];
        document.documentElement.style.setProperty('--font-family-body', `'${bodyFontName}', sans-serif`);
        document.documentElement.style.setProperty('--font-family-headline', `'${headlineFontName}', sans-serif`);
        
        if (storedFgColor) {
             document.documentElement.style.setProperty('--foreground', storedFgColor);
        }
    };

    handleThemeChange(); // Apply on initial load

    // Create a new event listener for our custom event
    const themeChangedListener = () => handleThemeChange();
    window.addEventListener('theme-changed', themeChangedListener);

    return () => {
      window.removeEventListener('theme-changed', themeChangedListener);
    };
  }, []);
  
  // Effect to load font stylesheets
  React.useEffect(() => {
    const createLink = (href: string) => {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return link;
    };

    const bodyFontUrl = FONT_URLS[bodyFont];
    const headlineFontUrl = FONT_URLS[headlineFont];

    const bodyLink = createLink(bodyFontUrl);
    let headlineLink: HTMLLinkElement | null = null;
    if (bodyFont !== headlineFont) {
        headlineLink = createLink(headlineFontUrl);
    }
    
    return () => {
        document.head.removeChild(bodyLink);
        if (headlineLink) {
            document.head.removeChild(headlineLink);
        }
    }
  }, [bodyFont, headlineFont]);


  return (
    <NextThemesProvider {...props}>
        <ThemeContext.Provider value={{ sidebarPosition, setSidebarPosition, mobileSidebarPosition, setMobileSidebarPosition }}>
            {children}
        </ThemeContext.Provider>
    </NextThemesProvider>
  )
}

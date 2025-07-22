
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Paintbrush } from 'lucide-react';

const COLORS = [
  { name: 'Default', value: '283 44% 50%' },
  { name: 'Zinc', value: '240 5.9% 10%' },
  { name: 'Rose', value: '346.8 77.2% 49.8%' },
  { name: 'Blue', value: '221.2 83.2% 53.3%' },
  { name: 'Green', value: '142.1 76.2% 36.3%' },
  { name: 'Orange', value: '24.6 95% 53.1%' },
];

const ACCENT_COLORS = [
    { name: 'Default', value: '346 46% 65%' },
    { name: 'Slate', value: '215.4 16.3% 46.9%' },
    { name: 'Violet', value: '262.1 83.3% 57.8%' },
    { name: 'Yellow', value: '47.9 95.8% 53.1%' },
    { name: 'Lime', value: '84.2 90.2% 51.4%'},
    { name: 'Pink', value: '332.2 92.5% 61.4%'},
];

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrimaryColorChange = (colorValue: string) => {
    document.documentElement.style.setProperty('--primary', colorValue);
    if(theme === 'dark') {
      const [h, s] = colorValue.split(' ');
      document.documentElement.style.setProperty('--primary', `${h} ${s} 60%`);
    }
  };

  const handleAccentColorChange = (colorValue: string) => {
    document.documentElement.style.setProperty('--accent', colorValue);
     if(theme === 'dark') {
      const [h, s] = colorValue.split(' ');
      document.documentElement.style.setProperty('--accent', `${h} ${s} 75%`);
    }
  };
  
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            <h3 className="font-medium">Customize Theme</h3>
        </div>
      <div className="space-y-2">
        <Label>Primary Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              className="h-8 w-8 rounded-full border-2 border-transparent transition-transform hover:scale-110"
              style={{ backgroundColor: `hsl(${color.value})` }}
              onClick={() => handlePrimaryColorChange(color.value)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Accent Color</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.name}
              className="h-8 w-8 rounded-full border-2 border-transparent transition-transform hover:scale-110"
              style={{ backgroundColor: `hsl(${color.value})` }}
              onClick={() => handleAccentColorChange(color.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Paintbrush, Type, TextCursor, Palette } from 'lucide-react';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const PRIMARY_COLORS = [
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

const FOREGROUND_COLORS = [
    { name: 'Default', value: '240 10% 3.9%' },
    { name: 'Slate', value: '215.4 16.3% 46.9%' },
    { name: 'Gray', value: '240 4.8% 30%' },
    { name: 'Stone', value: '25 5.3% 30.2%'},
    { name: 'Neutral', value: '0 0% 30.2%'},
];

const FONTS = [
    { name: 'Inter', value: 'inter' },
    { name: 'Space Grotesk', value: 'space_grotesk' },
    { name: 'Roboto', value: 'roboto' },
    { name: 'Lato', value: 'lato' },
    { name: 'Montserrat', value: 'montserrat' },
    { name: 'Oswald', value: 'oswald' },
]

function dispatchThemeChange() {
    window.dispatchEvent(new Event('theme-changed'));
}

export function ThemeCustomizer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    setMounted(true);
    const savedFontSize = localStorage.getItem('theme-font-size');
    if (savedFontSize) {
        setFontSize(parseInt(savedFontSize, 10));
    }
  }, []);

  const handleColorChange = (property: string, colorValue: string, isDarkComp: boolean) => {
    document.documentElement.style.setProperty(property, colorValue);
    if(theme === 'dark' && isDarkComp) {
      const [h, s] = colorValue.split(' ');
      const newLightness = property === '--primary' ? '60%' : '75%';
      document.documentElement.style.setProperty(property, `${h} ${s} ${newLightness}`);
    }
    const storageKey = `theme-color-${property.replace('--', '')}`;
    localStorage.setItem(storageKey, colorValue);
    dispatchThemeChange();
  };
  
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    document.documentElement.style.setProperty('--font-size-base', `${newSize}px`);
    localStorage.setItem('theme-font-size', newSize.toString());
    dispatchThemeChange();
  };

  const handleFontChange = (type: 'body' | 'headline', fontValue: string) => {
    localStorage.setItem(`theme-font-${type}`, fontValue);
    dispatchThemeChange();
  };
  
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <h3 className="font-medium">Colors</h3>
            </div>
            <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex flex-wrap gap-2">
                {PRIMARY_COLORS.map((color) => (
                    <button
                    key={color.name}
                    className="h-8 w-8 rounded-full border-2 border-transparent transition-transform hover:scale-110"
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    onClick={() => handleColorChange('--primary', color.value, true)}
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
                    onClick={() => handleColorChange('--accent', color.value, true)}
                    />
                ))}
                </div>
            </div>
             <div className="space-y-2">
                <Label>Font Color</Label>
                <div className="flex flex-wrap gap-2">
                {FOREGROUND_COLORS.map((color) => (
                    <button
                    key={color.name}
                    className="h-8 w-8 rounded-full border-2 border-transparent transition-transform hover:scale-110"
                    style={{ backgroundColor: `hsl(${color.value})` }}
                    onClick={() => handleColorChange('--foreground', color.value, false)}
                    />
                ))}
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                <h3 className="font-medium">Typography</h3>
            </div>
            <div className="space-y-2">
                <Label>Font Size: {fontSize}px</Label>
                <Slider
                    min={12}
                    max={20}
                    step={1}
                    value={[fontSize]}
                    onValueChange={handleFontSizeChange}
                />
            </div>
            <div className="space-y-2">
                <Label>Body Font</Label>
                 <Select
                    defaultValue={localStorage.getItem('theme-font-body') || 'inter'}
                    onValueChange={(value) => handleFontChange('body', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select body font" />
                    </SelectTrigger>
                    <SelectContent>
                        {FONTS.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                                {font.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Headline Font</Label>
                <Select
                    defaultValue={localStorage.getItem('theme-font-headline') || 'space_grotesk'}
                    onValueChange={(value) => handleFontChange('headline', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select headline font" />
                    </SelectTrigger>
                    <SelectContent>
                        {FONTS.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                                {font.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
  );
}

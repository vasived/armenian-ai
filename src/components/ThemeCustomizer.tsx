import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Palette, 
  Check, 
  RefreshCw,
  Sun,
  Moon,
  Star,
  Heart,
  Sparkles,
  Mountain,
  Waves,
  Flame
} from "lucide-react";
import { ArmenianIcon } from "@/components/ArmenianIcon";
import { cn } from "@/lib/utils";
import { progressManager } from "@/lib/progressManager";

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  cssVars: Record<string, string>;
  icon: React.ReactNode;
}

interface ThemeCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themes: Theme[] = [
  {
    id: 'default',
    name: 'Armenian Heritage',
    description: 'Traditional colors inspired by Armenian culture',
    preview: {
      primary: '#D6336C',
      secondary: '#F3F4F6',
      accent: '#3B82F6',
      background: '#FFFFFF'
    },
    cssVars: {
      '--primary': '355 78% 60%',
      '--secondary': '220 14% 96%',
      '--accent': '213 94% 68%',
      '--background': '0 0% 100%'
    },
    icon: <ArmenianIcon className="h-4 w-4" />
  },
  {
    id: 'sunset',
    name: 'Ararat Sunset',
    description: 'Warm colors inspired by Mount Ararat at sunset',
    preview: {
      primary: '#F59E0B',
      secondary: '#FEF3C7',
      accent: '#EF4444',
      background: '#FFFBEB'
    },
    cssVars: {
      '--primary': '43 96% 56%',
      '--secondary': '48 96% 89%',
      '--accent': '0 84% 60%',
      '--background': '48 100% 96%'
    },
    icon: <Mountain className="h-4 w-4" />
  },
  {
    id: 'sevan',
    name: 'Lake Sevan',
    description: 'Cool blues inspired by Armenia\'s beautiful lake',
    preview: {
      primary: '#0EA5E9',
      secondary: '#E0F2FE',
      accent: '#8B5CF6',
      background: '#F8FAFC'
    },
    cssVars: {
      '--primary': '199 89% 48%',
      '--secondary': '191 100% 93%',
      '--accent': '258 90% 66%',
      '--background': '210 40% 98%'
    },
    icon: <Waves className="h-4 w-4" />
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Regal purples for a sophisticated look',
    preview: {
      primary: '#7C3AED',
      secondary: '#F3E8FF',
      accent: '#F59E0B',
      background: '#FAFAFA'
    },
    cssVars: {
      '--primary': '262 83% 58%',
      '--secondary': '270 100% 95%',
      '--accent': '43 96% 56%',
      '--background': '0 0% 98%'
    },
    icon: <Star className="h-4 w-4" />
  },
  {
    id: 'forest',
    name: 'Armenian Forest',
    description: 'Natural greens inspired by Armenian forests',
    preview: {
      primary: '#059669',
      secondary: '#D1FAE5',
      accent: '#DC2626',
      background: '#F9FDF9'
    },
    cssVars: {
      '--primary': '160 84% 39%',
      '--secondary': '151 81% 86%',
      '--accent': '0 84% 50%',
      '--background': '120 60% 97%'
    },
    icon: <Heart className="h-4 w-4" />
  },
  {
    id: 'fire',
    name: 'Sacred Fire',
    description: 'Warm reds and oranges like eternal flames',
    preview: {
      primary: '#DC2626',
      secondary: '#FEE2E2',
      accent: '#F59E0B',
      background: '#FFFAF0'
    },
    cssVars: {
      '--primary': '0 84% 60%',
      '--secondary': '0 93% 94%',
      '--accent': '43 96% 56%',
      '--background': '39 100% 97%'
    },
    icon: <Flame className="h-4 w-4" />
  }
];

export const ThemeCustomizer = ({ open, onOpenChange }: ThemeCustomizerProps) => {
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [fontSize, setFontSize] = useState(100);
  const [borderRadius, setBorderRadius] = useState(75);
  const [animations, setAnimations] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load saved settings and apply them immediately
    const savedTheme = localStorage.getItem('hagopai_theme') || 'default';
    const savedFontSize = parseInt(localStorage.getItem('hagopai_font_size') || '100');
    const savedBorderRadius = parseInt(localStorage.getItem('hagopai_border_radius') || '75');
    const savedAnimations = localStorage.getItem('hagopai_animations') !== 'false';
    const savedHighContrast = localStorage.getItem('hagopai_high_contrast') === 'true';

    setSelectedTheme(savedTheme);
    setFontSize(savedFontSize);
    setBorderRadius(savedBorderRadius);
    setAnimations(savedAnimations);
    setHighContrast(savedHighContrast);

    // Apply theme immediately if not default
    if (savedTheme !== 'default') {
      applyTheme(savedTheme);
    }
    applyFontSize([savedFontSize]);
    applyBorderRadius([savedBorderRadius]);
    toggleAnimations(savedAnimations);
    toggleHighContrast(savedHighContrast);
  }, [open]);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    setSelectedTheme(themeId);
    localStorage.setItem('hagopai_theme', themeId);

    // Track theme usage
    progressManager.updateCustomizationProgress(themeId);
  };

  const applyFontSize = (size: number[]) => {
    const newSize = size[0];
    document.documentElement.style.fontSize = `${newSize}%`;
    setFontSize(newSize);
    localStorage.setItem('hagopai_font_size', newSize.toString());
  };

  const applyBorderRadius = (radius: number[]) => {
    const newRadius = radius[0];
    const remValue = (newRadius / 100) * 0.75; // Scale to rem
    document.documentElement.style.setProperty('--radius', `${remValue}rem`);
    setBorderRadius(newRadius);
    localStorage.setItem('hagopai_border_radius', newRadius.toString());
  };

  const toggleAnimations = (enabled: boolean) => {
    document.documentElement.style.setProperty(
      '--animation-duration', 
      enabled ? '0.2s' : '0s'
    );
    setAnimations(enabled);
    localStorage.setItem('hagopai_animations', enabled.toString());
  };

  const toggleHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    setHighContrast(enabled);
    localStorage.setItem('hagopai_high_contrast', enabled.toString());
  };

  const resetToDefaults = () => {
    applyTheme('default');
    applyFontSize([100]);
    applyBorderRadius([75]);
    toggleAnimations(true);
    toggleHighContrast(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customizer
            <Badge variant="secondary" className="ml-2">
              {themes.length} themes
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-8 p-1">
            {/* Theme Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose a Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <Card 
                    key={theme.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
                      selectedTheme === theme.id && "ring-2 ring-primary shadow-lg"
                    )}
                    onClick={() => applyTheme(theme.id)}
                  >
                    <div className="space-y-3">
                      {/* Preview */}
                      <div className="h-16 rounded-lg overflow-hidden relative">
                        <div 
                          className="absolute inset-0" 
                          style={{ backgroundColor: theme.preview.background }}
                        >
                          <div 
                            className="h-6 w-full"
                            style={{ backgroundColor: theme.preview.primary }}
                          />
                          <div className="p-2 space-y-1">
                            <div 
                              className="h-2 w-3/4 rounded"
                              style={{ backgroundColor: theme.preview.secondary }}
                            />
                            <div 
                              className="h-2 w-1/2 rounded"
                              style={{ backgroundColor: theme.preview.accent }}
                            />
                          </div>
                        </div>
                        {selectedTheme === theme.id && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-4 w-4 text-white bg-green-500 rounded-full p-0.5" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {theme.icon}
                          <h4 className="font-semibold">{theme.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Typography</h3>
              <Card className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium">Font Size</label>
                      <span className="text-sm text-muted-foreground">{fontSize}%</span>
                    </div>
                    <Slider
                      value={[fontSize]}
                      onValueChange={applyFontSize}
                      min={75}
                      max={125}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium">Border Radius</label>
                      <span className="text-sm text-muted-foreground">{borderRadius}%</span>
                    </div>
                    <Slider
                      value={[borderRadius]}
                      onValueChange={applyBorderRadius}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Animations</label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      checked={animations}
                      onCheckedChange={toggleAnimations}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">High Contrast</label>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better readability
                      </p>
                    </div>
                    <Switch
                      checked={highContrast}
                      onCheckedChange={toggleHighContrast}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <Card className="p-6">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold">Sample Content</h4>
                  <p className="text-muted-foreground">
                    This is how your interface will look with the selected theme and settings.
                  </p>
                  <div className="flex gap-2">
                    <Button>Primary Button</Button>
                    <Button variant="outline">Secondary Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                  </div>
                  <Card className="p-4 bg-accent/20">
                    <p className="text-sm">
                      <strong>HagopAI:</strong> Parev! This is how messages will appear in your chat.
                    </p>
                  </Card>
                </div>
              </Card>
            </div>

            {/* Reset */}
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

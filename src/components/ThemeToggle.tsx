
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover:bg-sage-100 dark:hover:bg-sage-800 transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-sage-700 dark:text-sage-300" />
      ) : (
        <Sun className="h-4 w-4 text-sage-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

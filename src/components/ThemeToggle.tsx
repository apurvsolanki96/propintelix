import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-yellow-500" />
      ) : (
        <Moon size={18} className="text-primary" />
      )}
    </Button>
  );
};

export default ThemeToggle;
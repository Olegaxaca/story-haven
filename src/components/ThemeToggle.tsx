import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {theme === "dark" ? (
          <Moon size={20} className="text-primary" />
        ) : (
          <Sun size={20} className="text-primary" />
        )}
        <Label htmlFor="theme-toggle" className="cursor-pointer">
          Светлая тема
        </Label>
      </div>
      <Switch
        id="theme-toggle"
        checked={theme === "light"}
        onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
      />
    </div>
  );
}

import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SearchHeader = () => {
  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-border/50">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">R</span>
          </div>
          <span className="font-semibold text-base">ReadHub</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск..."
            className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        {/* Actions */}
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
          <Bell size={18} />
        </Button>
      </div>
    </header>
  );
};

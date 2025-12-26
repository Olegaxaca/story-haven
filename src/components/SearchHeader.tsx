import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SearchHeader = () => {
  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-border/50">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-lg hidden sm:block">ReadHub</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск книг, манги, комиксов..."
            className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        {/* Actions */}
        <Button variant="ghost" size="icon" className="shrink-0">
          <Bell size={20} />
        </Button>
      </div>
    </header>
  );
};

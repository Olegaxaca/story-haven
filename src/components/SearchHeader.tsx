import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const SearchHeader = () => {
  const navigate = useNavigate();

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

        {/* Search bar - clickable to navigate */}
        <button
          onClick={() => navigate("/search")}
          className="flex-1 relative"
        >
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <div className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-8 pr-3 py-2 text-sm text-muted-foreground text-left">
            Поиск...
          </div>
        </button>

        {/* Actions */}
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
          <Bell size={18} />
        </Button>
      </div>
    </header>
  );
};

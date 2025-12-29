import { Button } from "@/components/ui/button";
import { LogOut, Edit2 } from "lucide-react";

interface ProfileHeaderProps {
  title: string;
  onLogout?: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
}

export const ProfileHeader = ({ title, onLogout, onEdit, showEdit }: ProfileHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 glass-effect border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="font-semibold text-lg">{title}</h1>
        <div className="flex items-center gap-2">
          {showEdit && onEdit && (
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 size={20} />
            </Button>
          )}
          {onLogout && (
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut size={20} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

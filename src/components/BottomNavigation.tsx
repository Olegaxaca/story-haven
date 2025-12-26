import { Home, Library, Search, Bookmark, User } from "lucide-react";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: <Home size={20} />, label: "Главная" },
  { id: "library", icon: <Library size={20} />, label: "Каталог" },
  { id: "search", icon: <Search size={20} />, label: "Поиск" },
  { id: "bookmarks", icon: <Bookmark size={20} />, label: "Закладки" },
  { id: "profile", icon: <User size={20} />, label: "Профиль" },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border/50">
      <div className="grid grid-cols-5 gap-0 px-1 py-1.5 pb-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground active:text-foreground"
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                isActive ? "bg-primary/20" : ""
              }`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-medium ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import { Home, Library, Search, Bookmark, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: <Home size={20} />, label: "Главная", path: "/" },
  { id: "library", icon: <Library size={20} />, label: "Каталог", path: "/catalog" },
  { id: "search", icon: <Search size={20} />, label: "Поиск", path: "/search" },
  { id: "bookmarks", icon: <Bookmark size={20} />, label: "Закладки", path: "/bookmarks" },
  { id: "profile", icon: <User size={20} />, label: "Профиль", path: "/profile" },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border/50">
      <div className="grid grid-cols-5 gap-0 px-1 py-1.5 pb-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
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

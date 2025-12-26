import { Home, Library, Search, Bookmark, User } from "lucide-react";
import { useState } from "react";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: <Home size={22} />, label: "Главная" },
  { id: "library", icon: <Library size={22} />, label: "Каталог" },
  { id: "search", icon: <Search size={22} />, label: "Поиск" },
  { id: "bookmarks", icon: <Bookmark size={22} />, label: "Закладки" },
  { id: "profile", icon: <User size={22} />, label: "Профиль" },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`nav-item flex-1 ${activeTab === item.id ? "active" : ""}`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

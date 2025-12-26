import { BookOpen, Sparkles, Zap, Heart } from "lucide-react";

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const categories: Category[] = [
  { id: "all", label: "Все", icon: <Sparkles size={16} />, color: "primary" },
  { id: "books", label: "Книги", icon: <BookOpen size={16} />, color: "books" },
  { id: "manga", label: "Манга", icon: <Zap size={16} />, color: "manga" },
  { id: "comics", label: "Комиксы", icon: <Zap size={16} />, color: "comics" },
  { id: "fanfic", label: "Фанфики", icon: <Heart size={16} />, color: "fanfic" },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto hide-scrollbar px-3 py-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`category-pill flex items-center gap-2 shrink-0 ${
            activeCategory === category.id ? "active" : ""
          }`}
        >
          {category.icon}
          {category.label}
        </button>
      ))}
    </div>
  );
};

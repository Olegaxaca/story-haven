import { ContentCard } from "./ContentCard";
import { ChevronRight } from "lucide-react";

interface ContentItem {
  id: string;
  cover: string;
  title: string;
  author?: string;
  rating?: number;
  type: "book" | "manga" | "comics" | "fanfic";
  progress?: number;
  chapters?: number;
  isNew?: boolean;
  isHot?: boolean;
}

interface ContentSectionProps {
  title: string;
  items: ContentItem[];
  showSeeAll?: boolean;
}

export const ContentSection = ({ title, items, showSeeAll = true }: ContentSectionProps) => {
  return (
    <section className="py-3">
      <div className="flex items-center justify-between px-3 mb-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {showSeeAll && (
          <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
            Все
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar px-3 pb-2">
        {items.map((item) => (
          <div key={item.id} className="w-[120px] shrink-0">
            <ContentCard {...item} />
          </div>
        ))}
      </div>
    </section>
  );
};

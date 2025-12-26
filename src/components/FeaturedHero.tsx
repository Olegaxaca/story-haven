import { Button } from "@/components/ui/button";
import { Play, Plus, Star, BookOpen } from "lucide-react";

interface FeaturedHeroProps {
  cover: string;
  title: string;
  description: string;
  rating: number;
  chapters: number;
  type: string;
}

export const FeaturedHero = ({
  cover,
  title,
  description,
  rating,
  chapters,
  type,
}: FeaturedHeroProps) => {
  return (
    <div className="relative h-[55vh] min-h-[380px] max-h-[480px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div 
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div 
          className="absolute inset-0 opacity-30"
          style={{ background: "var(--gradient-glow)" }}
        />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 animate-slide-up">
        <div className="max-w-lg">
          {/* Type badge */}
          <span className="inline-block bg-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 backdrop-blur-sm border border-primary/30">
            Рекомендуем · {type}
          </span>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2 leading-tight">
            {title}
          </h1>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-primary fill-primary" />
              <span className="text-foreground font-medium">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={14} />
              <span>{chapters} глав</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="hero" size="default" className="gap-1.5 text-sm h-10 px-5">
              <Play size={16} />
              Читать
            </Button>
            <Button variant="glass" size="default" className="gap-1.5 text-sm h-10 px-4">
              <Plus size={16} />
              В библиотеку
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
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
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 animate-slide-up">
        <div className="max-w-lg">
          {/* Type badge */}
          <span className="inline-block bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full mb-3 backdrop-blur-sm border border-primary/30">
            Рекомендуем · {type}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
            {title}
          </h1>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-primary fill-primary" />
              <span className="text-foreground font-medium">{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={16} />
              <span>{chapters} глав</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2 mb-5">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="hero" size="lg" className="gap-2">
              <Play size={18} />
              Читать
            </Button>
            <Button variant="glass" size="lg" className="gap-2">
              <Plus size={18} />
              В библиотеку
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

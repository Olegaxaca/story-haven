import { Star, BookOpen } from "lucide-react";

interface ContentCardProps {
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

export const ContentCard = ({
  cover,
  title,
  author,
  rating,
  type,
  progress,
  chapters,
  isNew,
  isHot,
}: ContentCardProps) => {
  const typeColors = {
    book: "bg-books",
    manga: "bg-manga",
    comics: "bg-comics",
    fanfic: "bg-fanfic",
  };

  const typeLabels = {
    book: "Книга",
    manga: "Манга",
    comics: "Комикс",
    fanfic: "Фанфик",
  };

  return (
    <div className="content-card group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
        <img
          src={cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "var(--gradient-card)" }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={`${typeColors[type]} text-foreground text-xs font-medium px-2 py-0.5 rounded-full`}>
            {typeLabels[type]}
          </span>
          {isNew && (
            <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              Новое
            </span>
          )}
          {isHot && (
            <span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              Топ
            </span>
          )}
        </div>

        {/* Rating */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star size={12} className="text-primary fill-primary" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="font-medium text-sm line-clamp-2 leading-tight">{title}</h3>
        {author && (
          <p className="text-muted-foreground text-xs mt-1 truncate">{author}</p>
        )}
        {chapters && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
            <BookOpen size={12} />
            <span>{chapters} глав</span>
          </div>
        )}
      </div>
    </div>
  );
};

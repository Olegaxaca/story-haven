import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContinueItem {
  id: string;
  cover: string;
  title: string;
  chapter: string;
  progress: number;
  type: "book" | "manga" | "comics" | "fanfic";
}

interface ContinueReadingProps {
  items: ContinueItem[];
}

export const ContinueReading = ({ items }: ContinueReadingProps) => {
  if (items.length === 0) return null;

  return (
    <section className="py-3 px-3">
      <h2 className="text-base font-semibold mb-2">Продолжить чтение</h2>
      
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-2.5 p-2.5 bg-card rounded-xl border border-border/50 hover:bg-card-hover transition-colors cursor-pointer group"
          >
            {/* Cover */}
            <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs mt-0.5">{item.chapter}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{item.progress}%</span>
              </div>
            </div>

            {/* Play button */}
            <Button
              variant="hero"
              size="icon"
              className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Play size={16} />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

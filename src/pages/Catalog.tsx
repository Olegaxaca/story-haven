import { useState, useEffect, useCallback, useRef } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ContentCard } from "@/components/ContentCard";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

// Import cover images
import featuredCover from "@/assets/covers/featured-1.jpg";
import manga1 from "@/assets/covers/manga-1.jpg";
import manga2 from "@/assets/covers/manga-2.jpg";
import manga3 from "@/assets/covers/manga-3.jpg";
import comics1 from "@/assets/covers/comics-1.jpg";
import fanfic1 from "@/assets/covers/fanfic-1.jpg";
import book2 from "@/assets/covers/book-2.jpg";
import book3 from "@/assets/covers/book-3.jpg";

const covers = [featuredCover, manga1, manga2, manga3, comics1, fanfic1, book2, book3];

type ContentType = "all" | "book" | "manga" | "comics" | "fanfic";
type SortOption = "popular" | "new" | "rating" | "chapters";

interface Genre {
  id: string;
  label: string;
}

const genres: Genre[] = [
  { id: "all", label: "Все" },
  { id: "fantasy", label: "Фэнтези" },
  { id: "romance", label: "Романтика" },
  { id: "action", label: "Экшен" },
  { id: "horror", label: "Ужасы" },
  { id: "scifi", label: "Научная фантастика" },
  { id: "mystery", label: "Детектив" },
  { id: "comedy", label: "Комедия" },
  { id: "drama", label: "Драма" },
  { id: "adventure", label: "Приключения" },
];

const contentTypes: { id: ContentType; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "book", label: "Книги" },
  { id: "manga", label: "Манга" },
  { id: "comics", label: "Комиксы" },
  { id: "fanfic", label: "Фанфики" },
];

const sortOptions: { id: SortOption; label: string }[] = [
  { id: "popular", label: "По популярности" },
  { id: "new", label: "По новизне" },
  { id: "rating", label: "По рейтингу" },
  { id: "chapters", label: "По главам" },
];

// Generate mock data
const generateContent = (count: number, startIndex: number = 0) => {
  const titles = [
    "Тёмный Властелин", "Лунный Свет", "Огненный Шторм", "Ледяное Сердце",
    "Звёздный Путь", "Кровавая Луна", "Небесный Воин", "Теневой Охотник",
    "Магический Круг", "Древнее Пророчество", "Последний Герой", "Врата Миров",
    "Тайна Замка", "Проклятие Ведьмы", "Песнь Дракона", "Ночной Странник"
  ];
  const authors = ["А. Петров", "М. Иванова", "И. Сидоров", "Е. Смирнова", "К. Волков"];
  const types: ("book" | "manga" | "comics" | "fanfic")[] = ["book", "manga", "comics", "fanfic"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${startIndex + i}`,
    cover: covers[(startIndex + i) % covers.length],
    title: titles[(startIndex + i) % titles.length],
    author: authors[(startIndex + i) % authors.length],
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    type: types[(startIndex + i) % types.length],
    chapters: Math.floor(50 + Math.random() * 400),
    isNew: Math.random() > 0.8,
    isHot: Math.random() > 0.85,
  }));
};

const Catalog = () => {
  const [selectedType, setSelectedType] = useState<ContentType>("all");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["all"]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [items, setItems] = useState(() => generateContent(12));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const toggleGenre = (genreId: string) => {
    if (genreId === "all") {
      setSelectedGenres(["all"]);
    } else {
      setSelectedGenres(prev => {
        const withoutAll = prev.filter(g => g !== "all");
        if (prev.includes(genreId)) {
          const newGenres = withoutAll.filter(g => g !== genreId);
          return newGenres.length === 0 ? ["all"] : newGenres;
        }
        return [...withoutAll, genreId];
      });
    }
  };

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newItems = generateContent(8, items.length);
      setItems(prev => [...prev, ...newItems]);
      setIsLoading(false);
      if (items.length >= 50) setHasMore(false);
    }, 800);
  }, [isLoading, hasMore, items.length]);

  // Reset items when filters change
  useEffect(() => {
    setItems(generateContent(12));
    setHasMore(true);
  }, [selectedType, selectedGenres, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const filteredItems = items.filter(item => {
    if (selectedType !== "all" && item.type !== selectedType) return false;
    return true;
  });

  const activeFiltersCount = (selectedGenres.includes("all") ? 0 : selectedGenres.length) + 
    (selectedType !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Title & Filters */}
      <div className="px-3 pt-2 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-foreground">Каталог</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <SlidersHorizontal size={14} />
              Фильтры
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary-foreground/20 text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSort(!showSort)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showSort ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {sortOptions.find(s => s.id === sortBy)?.label}
              <ChevronDown size={14} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        {showSort && (
          <div className="absolute right-3 mt-1 z-40 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
            {sortOptions.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  setSortBy(option.id);
                  setShowSort(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-xs transition-colors ${
                  sortBy === option.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-xl p-3 mb-3 border border-border animate-slide-up">
            {/* Content Type */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Тип контента</p>
              <div className="flex flex-wrap gap-1.5">
                {contentTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedType === type.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Жанры</p>
              <div className="flex flex-wrap gap-1.5">
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedGenres.includes(genre.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setSelectedType("all");
                  setSelectedGenres(["all"]);
                }}
                className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={12} />
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {/* Active filters pills */}
        {!showFilters && activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedType !== "all" && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                {contentTypes.find(t => t.id === selectedType)?.label}
                <button onClick={() => setSelectedType("all")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {!selectedGenres.includes("all") && selectedGenres.map(g => (
              <span key={g} className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                {genres.find(genre => genre.id === g)?.label}
                <button onClick={() => toggleGenre(g)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="px-3">
        <div className="grid grid-cols-3 gap-2">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${(index % 12) * 50}ms` }}
            >
              <ContentCard {...item} />
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div ref={loaderRef} className="py-6 flex justify-center">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Загрузка...</span>
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <p className="text-xs text-muted-foreground">Вы достигли конца каталога</p>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Catalog;

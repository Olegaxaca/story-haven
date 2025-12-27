import { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, X, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/ContentCard";
import { BottomNavigation } from "@/components/BottomNavigation";

// Mock data for search suggestions
const allContent = [
  { id: 1, title: "Наруто", type: "manga", genre: "Сёнен" },
  { id: 2, title: "Ванпанчмен", type: "manga", genre: "Экшен" },
  { id: 3, title: "Атака титанов", type: "manga", genre: "Драма" },
  { id: 4, title: "Моя геройская академия", type: "manga", genre: "Сёнен" },
  { id: 5, title: "Тетрадь смерти", type: "manga", genre: "Триллер" },
  { id: 6, title: "Ванпис", type: "manga", genre: "Приключения" },
  { id: 7, title: "Токийский гуль", type: "manga", genre: "Ужасы" },
  { id: 8, title: "Клинок рассекающий демонов", type: "manga", genre: "Экшен" },
  { id: 9, title: "Человек-бензопила", type: "manga", genre: "Экшен" },
  { id: 10, title: "Магическая битва", type: "manga", genre: "Сёнен" },
  { id: 11, title: "Сверхъестественное", type: "book", genre: "Фэнтези" },
  { id: 12, title: "Гарри Поттер", type: "book", genre: "Фэнтези" },
  { id: 13, title: "Властелин колец", type: "book", genre: "Фэнтези" },
  { id: 14, title: "Игра престолов", type: "book", genre: "Фэнтези" },
  { id: 15, title: "Ведьмак", type: "book", genre: "Фэнтези" },
];

const trendingSearches = [
  "Клинок рассекающий демонов",
  "Человек-бензопила",
  "Магическая битва",
  "Ванпис",
  "Наруто",
];

const RECENT_SEARCHES_KEY = "recentSearches";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allContent
      .filter(item => item.title.toLowerCase().includes(lowerQuery))
      .slice(0, 6);
  }, [query]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allContent.filter(item => 
      item.title.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 8);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedRecent));
    setQuery(searchQuery);
    setShowResults(true);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Search Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-border/50">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 h-8 w-8"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
          </Button>
          
          <div className="flex-1 relative">
            <SearchIcon size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Поиск манги, книг..."
              autoFocus
              className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-8 pr-8 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setShowResults(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-3 py-3">
        {/* Autocomplete Suggestions */}
        {query && !showResults && suggestions.length > 0 && (
          <div className="space-y-1 mb-4">
            {suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSearch(item.title)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
              >
                <SearchIcon size={14} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.type === "manga" ? "Манга" : "Книга"} • {item.genre}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search Results */}
        {showResults && query && (
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Найдено: {searchResults.length}
            </p>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {searchResults.map((item) => (
                  <ContentCard
                    key={item.id}
                    title={item.title}
                    cover={`https://picsum.photos/seed/${item.id}/200/280`}
                    rating={4.5}
                    chapters={100}
                    type={item.type as "manga" | "book"}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">Ничего не найдено</p>
              </div>
            )}
          </div>
        )}

        {/* Initial State - Recent & Trending */}
        {!query && !showResults && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium flex items-center gap-1.5">
                    <Clock size={14} className="text-muted-foreground" />
                    Недавние
                  </h2>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-primary"
                  >
                    Очистить
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <div
                      key={search}
                      className="flex items-center gap-1 bg-secondary/50 rounded-full pl-3 pr-1 py-1"
                    >
                      <button
                        onClick={() => handleSearch(search)}
                        className="text-xs"
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(search)}
                        className="p-0.5 hover:bg-secondary rounded-full"
                      >
                        <X size={12} className="text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <h2 className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <TrendingUp size={14} className="text-primary" />
                Популярное
              </h2>
              <div className="space-y-1">
                {trendingSearches.map((search, index) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <span className="text-xs font-medium text-primary w-4">{index + 1}</span>
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;

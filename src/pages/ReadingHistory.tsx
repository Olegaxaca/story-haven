import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/BottomNavigation";

// Mock content data - in a real app, this would come from an API
const mockContentData: Record<string, { title: string; author: string; cover: string; type: string }> = {
  "1": { title: "Solo Leveling", author: "Chugong", cover: "/placeholder.svg", type: "manga" },
  "2": { title: "The Beginning After The End", author: "TurtleMe", cover: "/placeholder.svg", type: "manga" },
  "3": { title: "Omniscient Reader", author: "Sing Shong", cover: "/placeholder.svg", type: "manga" },
  "4": { title: "Tower of God", author: "SIU", cover: "/placeholder.svg", type: "manga" },
  "5": { title: "The Legendary Moonlight Sculptor", author: "Nam Heesung", cover: "/placeholder.svg", type: "book" },
};

interface ReadingHistoryItem {
  id: string;
  content_id: string;
  chapter_number: number;
  total_chapters: number | null;
  scroll_position: number;
  last_read_at: string;
}

const ReadingHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("*")
        .order("last_read_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching reading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reading_progress")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHistory(history.filter((item) => item.id !== id));
      toast({
        title: "Removed",
        description: "Item removed from reading history",
      });
    } catch (error) {
      console.error("Error removing from history:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const formatLastRead = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getProgress = (item: ReadingHistoryItem) => {
    if (!item.total_chapters || item.total_chapters === 0) return 0;
    return Math.round((item.chapter_number / item.total_chapters) * 100);
  };

  const getContentData = (contentId: string) => {
    return mockContentData[contentId] || {
      title: `Content ${contentId}`,
      author: "Unknown",
      cover: "/placeholder.svg",
      type: "manga",
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Reading History</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view history</h2>
          <p className="text-muted-foreground mb-6">
            Your reading history will be saved when you're logged in
          </p>
          <Button onClick={() => navigate("/profile")}>Sign In</Button>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Reading History</h1>
        </div>
      </header>

      <main className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-24 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-2 bg-muted rounded w-full mt-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No reading history</h2>
            <p className="text-muted-foreground mb-6">
              Start reading to see your history here
            </p>
            <Button onClick={() => navigate("/catalog")}>Browse Catalog</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const content = getContentData(item.content_id);
              const progress = getProgress(item);

              return (
                <div
                  key={item.id}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex gap-4">
                    <div
                      className="w-16 h-24 rounded-lg bg-cover bg-center flex-shrink-0 cursor-pointer"
                      style={{ backgroundImage: `url(${content.cover})` }}
                      onClick={() => navigate(`/content/${item.content_id}`)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/content/${item.content_id}`)}
                        >
                          <h3 className="font-semibold truncate">{content.title}</h3>
                          <p className="text-sm text-muted-foreground">{content.author}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromHistory(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatLastRead(item.last_read_at)}</span>
                        <span className="text-border">•</span>
                        <span>
                          Chapter {item.chapter_number}
                          {item.total_chapters && ` / ${item.total_chapters}`}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>

                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() =>
                          navigate(`/read/${item.content_id}/${item.chapter_number}`)
                        }
                      >
                        Continue Reading
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ReadingHistory;

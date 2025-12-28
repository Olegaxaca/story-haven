import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, Trash2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

interface BookmarkItem {
  id: string;
  content_id: string;
  content_type: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  created_at: string;
}

const Bookmarks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive",
      });
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  };

  const removeBookmark = async (id: string) => {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
    } else {
      setBookmarks(bookmarks.filter((b) => b.id !== id));
      toast({
        title: "Removed",
        description: "Bookmark removed successfully",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "manga":
        return "bg-pink-500/20 text-pink-400";
      case "comics":
        return "bg-blue-500/20 text-blue-400";
      case "books":
        return "bg-amber-500/20 text-amber-400";
      case "fanfic":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Bookmarks</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Login Required</h2>
          <p className="text-muted-foreground text-center mb-6">
            Please login to access your bookmarks and sync across devices
          </p>
          <Button onClick={() => navigate("/profile")} className="gap-2">
            <LogIn className="w-4 h-4" />
            Go to Login
          </Button>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Bookmarks</h1>
          <span className="text-sm text-muted-foreground">({bookmarks.length})</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Bookmarks Yet</h2>
          <p className="text-muted-foreground text-center">
            Start adding content to your bookmarks to see them here
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex gap-3 p-3 bg-card rounded-xl border border-border"
            >
              <div className="w-16 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {bookmark.cover_url ? (
                  <img
                    src={bookmark.cover_url}
                    alt={bookmark.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize mb-1 ${getTypeColor(
                    bookmark.content_type
                  )}`}
                >
                  {bookmark.content_type}
                </span>
                <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                  {bookmark.title}
                </h3>
                {bookmark.author && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {bookmark.author}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeBookmark(bookmark.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Bookmarks;

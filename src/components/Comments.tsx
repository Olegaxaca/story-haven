import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface Comment {
  id: string;
  content_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentsProps {
  contentId: string;
}

export const Comments = ({ contentId }: CommentsProps) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  const fetchComments = async () => {
    setIsLoading(true);
    
    const { data: commentsData, error } = await supabase
      .from("comments")
      .select("*")
      .eq("content_id", contentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      setIsLoading(false);
      return;
    }

    // Fetch profiles for all comment authors
    if (commentsData && commentsData.length > 0) {
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profile: profileMap.get(comment.user_id) || null,
      }));

      setComments(commentsWithProfiles);
    } else {
      setComments([]);
    }

    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Требуется вход",
        description: "Войдите в аккаунт, чтобы оставлять комментарии",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Пустой комментарий",
        description: "Напишите что-нибудь перед отправкой",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("comments")
      .insert({
        content_id: contentId,
        user_id: user.id,
        text: newComment.trim(),
      });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить комментарий",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
      toast({
        title: "Отправлено",
        description: "Комментарий добавлен",
      });
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить комментарий",
        variant: "destructive",
      });
    } else {
      setComments(comments.filter(c => c.id !== commentId));
      toast({
        title: "Удалено",
        description: "Комментарий удалён",
      });
    }
  };

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Комментарии ({comments.length})
      </h2>

      {/* New comment form */}
      <div className="mb-6">
        <Textarea
          placeholder={user ? "Напишите комментарий..." : "Войдите, чтобы оставить комментарий"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          className="mb-2 resize-none"
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          disabled={!user || isSubmitting || !newComment.trim()}
          className="w-full gap-2"
        >
          <Send className="w-4 h-4" />
          Отправить
        </Button>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Загрузка комментариев...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Пока нет комментариев. Будьте первым!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card rounded-lg p-4 border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {comment.profile?.avatar_url ? (
                    <img
                      src={comment.profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-foreground truncate">
                      {comment.profile?.display_name || "Пользователь"}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                  <p className="text-foreground text-sm whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

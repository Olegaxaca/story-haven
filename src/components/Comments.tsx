import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2, User as UserIcon, Reply, ChevronDown, ChevronUp } from "lucide-react";
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
  parent_id: string | null;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

interface CommentsProps {
  contentId: string;
}

export const Comments = ({ contentId }: CommentsProps) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

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

      // Organize into threaded structure
      const topLevelComments: Comment[] = [];
      const repliesMap = new Map<string, Comment[]>();

      commentsWithProfiles.forEach(comment => {
        if (comment.parent_id) {
          const existing = repliesMap.get(comment.parent_id) || [];
          existing.push(comment);
          repliesMap.set(comment.parent_id, existing);
        } else {
          topLevelComments.push(comment);
        }
      });

      // Sort replies by date (oldest first for natural conversation flow)
      repliesMap.forEach((replies) => {
        replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });

      // Attach replies to parent comments
      topLevelComments.forEach(comment => {
        comment.replies = repliesMap.get(comment.id) || [];
      });

      setComments(topLevelComments);
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
        parent_id: null,
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

  const handleReply = async () => {
    if (!user || !replyTo) return;

    if (!replyText.trim()) {
      toast({
        title: "Пустой ответ",
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
        text: replyText.trim(),
        parent_id: replyTo.id,
      });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить ответ",
        variant: "destructive",
      });
    } else {
      setReplyText("");
      setReplyTo(null);
      // Expand replies for this comment
      setExpandedReplies(prev => new Set([...prev, replyTo.id]));
      fetchComments();
      toast({
        title: "Отправлено",
        description: "Ответ добавлен",
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
      fetchComments();
      toast({
        title: "Удалено",
        description: "Комментарий удалён",
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`bg-card rounded-lg p-4 border border-border ${isReply ? "ml-8 mt-2" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`${isReply ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {comment.profile?.avatar_url ? (
            <img
              src={comment.profile.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className={`${isReply ? "w-4 h-4" : "w-5 h-5"} text-muted-foreground`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`font-medium text-foreground truncate ${isReply ? "text-sm" : ""}`}>
              {comment.profile?.display_name || "Пользователь"}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ru,
              })}
            </span>
          </div>
          <p className={`text-foreground whitespace-pre-wrap break-words ${isReply ? "text-sm" : "text-sm"}`}>
            {comment.text}
          </p>
          
          {/* Reply button for top-level comments only */}
          {!isReply && user && (
            <button
              onClick={() => {
                setReplyTo(comment);
                setReplyText("");
              }}
              className="mt-2 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <Reply className="w-3 h-3" />
              Ответить
            </button>
          )}
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

      {/* Reply form */}
      {replyTo?.id === comment.id && (
        <div className="mt-3 ml-13 pl-3 border-l-2 border-primary/30">
          <Textarea
            placeholder={`Ответить ${comment.profile?.display_name || "пользователю"}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="mb-2 resize-none text-sm"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              onClick={handleReply}
              disabled={isSubmitting || !replyText.trim()}
              size="sm"
              className="gap-1"
            >
              <Send className="w-3 h-3" />
              Отправить
            </Button>
            <Button
              onClick={() => {
                setReplyTo(null);
                setReplyText("");
              }}
              variant="ghost"
              size="sm"
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Replies toggle and list */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => toggleReplies(comment.id)}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            {expandedReplies.has(comment.id) ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Скрыть ответы ({comment.replies.length})
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Показать ответы ({comment.replies.length})
              </>
            )}
          </button>
          
          {expandedReplies.has(comment.id) && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Комментарии ({totalComments})
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
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

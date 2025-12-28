import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, BookOpen, Bookmark, BookmarkCheck, Share2, Heart, Eye, Clock, User as UserIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

import featuredCover from "@/assets/covers/featured-1.jpg";
import manga1 from "@/assets/covers/manga-1.jpg";
import manga2 from "@/assets/covers/manga-2.jpg";
import manga3 from "@/assets/covers/manga-3.jpg";
import book2 from "@/assets/covers/book-2.jpg";
import book3 from "@/assets/covers/book-3.jpg";
import comics1 from "@/assets/covers/comics-1.jpg";
import fanfic1 from "@/assets/covers/fanfic-1.jpg";

// Mock content database
const contentDatabase: Record<string, ContentItem> = {
  "b1": { id: "b1", cover: featuredCover, title: "Врата Пламени", author: "А. Петров", rating: 4.8, type: "book", chapters: 342, isHot: true, views: 125400, likes: 8920, description: "Древний мир, полный магии и опасностей. Молодой искатель приключений обнаруживает таинственные врата, которые могут изменить судьбу всего королевства. Путешествие через неизведанные земли, встречи с могущественными существами и раскрытие древних тайн ждут героя на каждом шагу.", genres: ["Фэнтези", "Приключения", "Магия"], status: "Продолжается", lastUpdate: "2024-01-15" },
  "b2": { id: "b2", cover: book2, title: "Тёмная Волшебница", author: "М. Иванова", rating: 4.6, type: "book", chapters: 215, views: 89200, likes: 6540, description: "История молодой волшебницы, чья сила пробуждается в самый неожиданный момент. Борьба с тьмой внутри и снаружи, поиск своего места в мире магии.", genres: ["Фэнтези", "Романтика", "Тёмное фэнтези"], status: "Завершён", lastUpdate: "2023-12-20" },
  "b3": { id: "b3", cover: book3, title: "Последний Драконоборец", author: "И. Сидоров", rating: 4.9, type: "book", chapters: 428, isNew: true, views: 156000, likes: 12300, description: "В мире, где драконы правят небесами, один человек осмеливается бросить им вызов. Эпическая сага о мужестве, чести и цене победы.", genres: ["Эпическое фэнтези", "Экшен", "Драма"], status: "Продолжается", lastUpdate: "2024-01-18" },
  "b4": { id: "b4", cover: fanfic1, title: "Звёздные Любовники", author: "Е. Смирнова", rating: 4.5, type: "book", chapters: 156, views: 67800, likes: 5200, description: "Космическая история любви между двумя существами из разных галактик.", genres: ["Научная фантастика", "Романтика"], status: "Завершён", lastUpdate: "2023-11-10" },
  "m1": { id: "m1", cover: manga1, title: "Герой Бури", rating: 4.9, type: "manga", chapters: 245, isHot: true, views: 234500, likes: 18700, description: "Молодой герой с силой управлять штормами встаёт на защиту своего мира от древнего зла. Захватывающие бои и неожиданные повороты сюжета.", genres: ["Сёнен", "Экшен", "Супергерои"], status: "Продолжается", lastUpdate: "2024-01-20" },
  "m2": { id: "m2", cover: manga2, title: "Кибер-Тень", rating: 4.7, type: "manga", chapters: 178, isNew: true, views: 145600, likes: 11200, description: "В мире высоких технологий хакер-призрак раскрывает заговор мегакорпораций.", genres: ["Киберпанк", "Триллер", "Научная фантастика"], status: "Продолжается", lastUpdate: "2024-01-19" },
  "m3": { id: "m3", cover: manga3, title: "Приключения Академии", rating: 4.5, type: "manga", chapters: 89, views: 78900, likes: 6100, description: "Жизнь студентов в элитной академии магии полна испытаний, дружбы и соперничества.", genres: ["Школьная жизнь", "Комедия", "Магия"], status: "Продолжается", lastUpdate: "2024-01-17" },
  "m4": { id: "m4", cover: manga1, title: "Воин Луны", rating: 4.8, type: "manga", chapters: 312, views: 189000, likes: 14500, description: "Древний воин пробуждается в современном мире, чтобы защитить человечество.", genres: ["Экшен", "Сверхъестественное", "Драма"], status: "Продолжается", lastUpdate: "2024-01-16" },
  "c1": { id: "c1", cover: comics1, title: "Ночной Страж", rating: 4.6, type: "comics", chapters: 56, isNew: true, views: 56700, likes: 4300, description: "Таинственный герой защищает город от преступности под покровом ночи.", genres: ["Супергерои", "Нуар", "Экшен"], status: "Продолжается", lastUpdate: "2024-01-14" },
  "c2": { id: "c2", cover: comics1, title: "Тёмный Мститель", rating: 4.4, type: "comics", chapters: 78, views: 67800, likes: 5100, description: "История антигероя, балансирующего на грани добра и зла.", genres: ["Антигерой", "Триллер", "Экшен"], status: "Завершён", lastUpdate: "2023-10-05" },
  "c3": { id: "c3", cover: book3, title: "Герои Завтрашнего Дня", rating: 4.7, type: "comics", chapters: 124, isHot: true, views: 98400, likes: 7800, description: "Команда молодых супергероев спасает мир от межгалактической угрозы.", genres: ["Супергерои", "Команда", "Научная фантастика"], status: "Продолжается", lastUpdate: "2024-01-12" },
  "f1": { id: "f1", cover: fanfic1, title: "Лунный Свет", author: "KittyWriter", rating: 4.8, type: "fanfic", chapters: 67, isHot: true, views: 123400, likes: 9800, description: "Альтернативная история любимых персонажей в новом, неожиданном сеттинге.", genres: ["AU", "Романтика", "Драма"], status: "Продолжается", lastUpdate: "2024-01-21" },
  "f2": { id: "f2", cover: fanfic1, title: "Второй Шанс", author: "DreamCatcher", rating: 4.5, type: "fanfic", chapters: 134, views: 89600, likes: 7200, description: "Что если бы герой мог переписать прошлое? История о выборе и последствиях.", genres: ["Таймтревел", "Драма", "Что если"], status: "Завершён", lastUpdate: "2023-12-28" },
  "f3": { id: "f3", cover: book2, title: "Тени Прошлого", author: "NightOwl", rating: 4.6, type: "fanfic", chapters: 89, isNew: true, views: 76500, likes: 6100, description: "Тёмные секреты прошлого возвращаются, чтобы изменить настоящее.", genres: ["Ангст", "Драма", "Мистика"], status: "Продолжается", lastUpdate: "2024-01-13" },
};

interface ContentItem {
  id: string;
  cover: string;
  title: string;
  author?: string;
  rating: number;
  type: "book" | "manga" | "comics" | "fanfic";
  chapters: number;
  isNew?: boolean;
  isHot?: boolean;
  views?: number;
  likes?: number;
  description?: string;
  genres?: string[];
  status?: string;
  lastUpdate?: string;
}

const ContentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const content = id ? contentDatabase[id] : null;

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
    if (user && id) {
      checkBookmarkStatus();
    }
  }, [user, id]);

  const checkBookmarkStatus = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("content_id", id)
      .maybeSingle();
    
    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Требуется вход",
        description: "Войдите в аккаунт, чтобы добавлять закладки",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }

    if (!content || !id) return;

    setBookmarkLoading(true);

    if (isBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("content_id", id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить закладку",
          variant: "destructive",
        });
      } else {
        setIsBookmarked(false);
        toast({
          title: "Удалено",
          description: "Закладка удалена",
        });
      }
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: user.id,
          content_id: id,
          content_type: content.type,
          title: content.title,
          author: content.author || null,
          cover_url: content.cover,
        });

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить закладку",
          variant: "destructive",
        });
      } else {
        setIsBookmarked(true);
        toast({
          title: "Добавлено",
          description: "Добавлено в закладки",
        });
      }
    }

    setBookmarkLoading(false);
  };

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "М";
    if (num >= 1000) return (num / 1000).toFixed(1) + "К";
    return num.toString();
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Не найдено</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <p className="text-muted-foreground">Контент не найден</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with cover background */}
      <div className="relative">
        <div className="absolute inset-0 h-64">
          <img
            src={content.cover}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Navigation */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 bg-background/50 backdrop-blur-sm rounded-full">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 bg-background/50 backdrop-blur-sm rounded-full">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Cover and info */}
        <div className="relative z-10 px-4 pt-4 pb-6">
          <div className="flex gap-4">
            <div className="w-32 flex-shrink-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={content.cover}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 pt-2">
              <div className="flex flex-wrap gap-1 mb-2">
                <span className={`${typeColors[content.type]} text-foreground text-xs font-medium px-2 py-0.5 rounded-full`}>
                  {typeLabels[content.type]}
                </span>
                {content.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    Новое
                  </span>
                )}
                {content.isHot && (
                  <span className="bg-destructive text-destructive-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    Топ
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-foreground mb-1">{content.title}</h1>
              {content.author && (
                <p className="text-muted-foreground text-sm flex items-center gap-1 mb-2">
                  <UserIcon size={14} />
                  {content.author}
                </p>
              )}

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-primary fill-primary" />
                  <span className="font-medium">{content.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen size={14} />
                  <span>{content.chapters} гл.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-y border-border bg-card/50">
        <div className="flex justify-around text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-foreground font-medium">
              <Eye size={16} className="text-muted-foreground" />
              {formatNumber(content.views || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Просмотры</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-foreground font-medium">
              <Heart size={16} className="text-muted-foreground" />
              {formatNumber(content.likes || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Лайки</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-foreground font-medium">
              <Clock size={16} className="text-muted-foreground" />
              {content.status}
            </div>
            <p className="text-xs text-muted-foreground">Статус</p>
          </div>
        </div>
      </div>

      {/* Bookmark button */}
      <div className="px-4 py-4">
        <Button
          onClick={toggleBookmark}
          disabled={bookmarkLoading}
          className={`w-full gap-2 ${isBookmarked ? "bg-primary" : "bg-muted hover:bg-muted/80"}`}
          variant={isBookmarked ? "default" : "secondary"}
          size="lg"
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="w-5 h-5" />
              В закладках
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5" />
              Добавить в закладки
            </>
          )}
        </Button>
      </div>

      {/* Genres */}
      {content.genres && content.genres.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">Жанры</h2>
          <div className="flex flex-wrap gap-2">
            {content.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-foreground mb-2">Описание</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {content.description}
        </p>
      </div>

      {/* Last update */}
      {content.lastUpdate && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground">
            Последнее обновление: {new Date(content.lastUpdate).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
        </div>
      )}

      {/* Read button */}
      <div className="px-4 pb-6">
        <Button 
          className="w-full gap-2" 
          size="lg"
          onClick={() => navigate(`/read/${id}/1`)}
        >
          <Play className="w-5 h-5" />
          Начать читать
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ContentDetails;

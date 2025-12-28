import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Sun, Moon, Type, Minus, Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Mock chapter content
const generateChapterContent = (chapterNum: number) => {
  const paragraphs = [
    "Солнце медленно опускалось за горизонт, окрашивая небо в оттенки красного и золотого. Герой стоял на вершине холма, глядя на раскинувшуюся перед ним долину. Впереди его ждало неизвестное, но он был готов.",
    "«Время пришло», — прошептал он, сжимая в руке древний артефакт. Сила пульсировала внутри него, словно живое существо, рвущееся на свободу. Он чувствовал каждую вибрацию, каждый удар магической энергии.",
    "Ветер усилился, принося с собой запах надвигающейся бури. Но это была не обычная буря — это была буря магии, древней и могущественной. Небо потемнело, и первые молнии прорезали облака.",
    "Он сделал шаг вперёд. Потом ещё один. С каждым шагом земля под ногами дрожала сильнее. Где-то вдали раздался рёв — враг почувствовал его приближение.",
    "Воспоминания о прошлом пронеслись перед его глазами: детство в маленькой деревне, годы обучения у старого мастера, друзья, которых он потерял на этом пути. Всё это привело его сюда, к этому моменту.",
    "«Я не отступлю», — сказал он громче, обращаясь к самому себе и к тем, кто наблюдал из теней. Его голос звучал твёрдо, несмотря на страх, который он чувствовал глубоко внутри.",
    "Артефакт засветился ярче. Руны на его поверхности ожили, закружились в бешеном танце. Сила переполняла его, и он знал — пути назад больше нет.",
    "Внизу, у подножия холма, собралась армия тьмы. Тысячи глаз смотрели на него, тысячи клыков скалились в предвкушении битвы. Но он был один против всех — и это его не пугало.",
    "Он поднял руку, и мир замер. Время остановилось на мгновение, давая ему собраться с мыслями. А потом — взрыв света, и битва началась.",
    "Магия вырвалась на свободу, сметая всё на своём пути. Он двигался как ветер, как молния, как сама судьба. Враги падали один за другим, но их было слишком много.",
  ];

  return paragraphs.map((p, i) => `\n\n${p}`).join("") + `\n\n--- Глава ${chapterNum} ---\n\n` + 
    paragraphs.reverse().map((p, i) => `\n\n${p}`).join("");
};

const contentChapters: Record<string, { title: string; totalChapters: number }> = {
  "b1": { title: "Врата Пламени", totalChapters: 342 },
  "b2": { title: "Тёмная Волшебница", totalChapters: 215 },
  "b3": { title: "Последний Драконоборец", totalChapters: 428 },
  "m1": { title: "Герой Бури", totalChapters: 245 },
  "m2": { title: "Кибер-Тень", totalChapters: 178 },
  "f1": { title: "Лунный Свет", totalChapters: 67 },
};

type ReaderTheme = "light" | "dark" | "sepia";

const Reader = () => {
  const { id, chapter } = useParams<{ id: string; chapter: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<ReaderTheme>("dark");
  const [showUI, setShowUI] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const chapterNum = parseInt(chapter || "1", 10);
  const content = id ? contentChapters[id] : null;
  const chapterContent = generateChapterContent(chapterNum);

  // Load preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("reader_font_size");
    const savedTheme = localStorage.getItem("reader_theme");
    
    if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));
    if (savedTheme) setTheme(savedTheme as ReaderTheme);
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("reader_font_size", fontSize.toString());
    localStorage.setItem("reader_theme", theme);
  }, [fontSize, theme]);

  // Auth listener
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

  // Load reading progress
  useEffect(() => {
    if (user && id) {
      loadProgress();
    }
  }, [user, id]);

  const loadProgress = async () => {
    if (!id) return;
    
    const { data } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("content_id", id)
      .maybeSingle();
    
    if (data && contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight - window.innerHeight;
      contentRef.current.scrollTop = scrollHeight * (data.scroll_position / 100);
    }
  };

  // Save progress periodically
  const saveProgress = useCallback(async () => {
    if (!user || !id || !content) return;

    const { error } = await supabase
      .from("reading_progress")
      .upsert({
        user_id: user.id,
        content_id: id,
        chapter_number: chapterNum,
        scroll_position: scrollProgress,
        total_chapters: content.totalChapters,
        last_read_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,content_id"
      });

    if (error) {
      console.error("Failed to save progress:", error);
    }
  }, [user, id, chapterNum, scrollProgress, content]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && scrollProgress > 0) {
        saveProgress();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [saveProgress, user, scrollProgress]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [saveProgress]);

  // Scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    const progress = (target.scrollTop / scrollHeight) * 100;
    setScrollProgress(Math.round(progress));
  };

  // Toggle UI on content click
  const handleContentClick = () => {
    setShowUI(!showUI);
  };

  const goToChapter = (num: number) => {
    if (content && num >= 1 && num <= content.totalChapters) {
      saveProgress();
      navigate(`/read/${id}/${num}`);
    }
  };

  const themeStyles: Record<ReaderTheme, { bg: string; text: string; accent: string }> = {
    light: { bg: "bg-white", text: "text-gray-900", accent: "bg-gray-100" },
    dark: { bg: "bg-background", text: "text-foreground", accent: "bg-card" },
    sepia: { bg: "bg-amber-50", text: "text-amber-950", accent: "bg-amber-100" },
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Контент не найден</p>
      </div>
    );
  }

  const currentTheme = themeStyles[theme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors duration-300`}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header */}
      <div 
        className={`fixed top-1 left-0 right-0 z-40 transition-all duration-300 ${
          showUI ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className={`${currentTheme.accent} backdrop-blur-sm border-b border-border/50 px-4 py-3`}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                saveProgress();
                navigate(`/content/${id}`);
              }} 
              className="p-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 text-center px-4">
              <h1 className="font-medium text-sm truncate">{content.title}</h1>
              <p className="text-xs opacity-70">Глава {chapterNum} из {content.totalChapters}</p>
            </div>

            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <button className="p-2 -mr-2">
                  <Settings className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className={`${currentTheme.bg} ${currentTheme.text}`}>
                <SheetHeader>
                  <SheetTitle className={currentTheme.text}>Настройки чтения</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 py-4">
                  {/* Font size */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Размер шрифта</label>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        className="p-2 rounded-lg bg-muted"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1">
                        <Slider
                          value={[fontSize]}
                          onValueChange={([val]) => setFontSize(val)}
                          min={12}
                          max={28}
                          step={2}
                        />
                      </div>
                      <button 
                        onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                        className="p-2 rounded-lg bg-muted"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{fontSize}</span>
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Тема</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 bg-white text-gray-900 ${
                          theme === "light" ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span className="text-sm">Светлая</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 bg-gray-900 text-white ${
                          theme === "dark" ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span className="text-sm">Тёмная</span>
                      </button>
                      <button
                        onClick={() => setTheme("sepia")}
                        className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 bg-amber-50 text-amber-950 ${
                          theme === "sepia" ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <Type className="w-4 h-4" />
                        <span className="text-sm">Сепия</span>
                      </button>
                    </div>
                  </div>

                  {/* Chapter navigation */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Перейти к главе</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={content.totalChapters}
                        defaultValue={chapterNum}
                        className={`flex-1 p-3 rounded-lg border border-border ${currentTheme.bg} ${currentTheme.text}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = parseInt((e.target as HTMLInputElement).value, 10);
                            if (val >= 1 && val <= content.totalChapters) {
                              setSettingsOpen(false);
                              goToChapter(val);
                            }
                          }
                        }}
                      />
                      <Button 
                        onClick={() => {
                          setSettingsOpen(false);
                          navigate(`/content/${id}`);
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <List className="w-4 h-4" />
                        Оглавление
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="min-h-screen px-4 py-20 overflow-auto"
        onScroll={handleScroll}
        onClick={handleContentClick}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center">
            Глава {chapterNum}
          </h2>
          <div 
            className="leading-relaxed whitespace-pre-line"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          >
            {chapterContent}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
          showUI ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        }`}
      >
        <div className={`${currentTheme.accent} backdrop-blur-sm border-t border-border/50 px-4 py-3`}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              disabled={chapterNum <= 1}
              onClick={() => goToChapter(chapterNum - 1)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </Button>
            
            <span className="text-sm opacity-70">
              {scrollProgress}%
            </span>

            <Button
              variant="ghost"
              disabled={chapterNum >= content.totalChapters}
              onClick={() => goToChapter(chapterNum + 1)}
              className="gap-2"
            >
              Далее
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reader;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileEditSheet } from "@/components/profile/ProfileEditSheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useProfile } from "@/hooks/useProfile";
import { useReadingStats } from "@/hooks/useReadingStats";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  BookOpen, 
  Heart, 
  Settings,
  ChevronRight,
  UserCircle,
  Link as LinkIcon,
  History,
  Crown,
  Palette,
  ShieldCheck,
  UserPlus,
  Globe,
  HelpCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<string | null>(null);
  const { toast } = useToast();

  const { profile, refetch: refetchProfile } = useProfile(user?.id);
  const { stats } = useReadingStats(user?.id);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsGuest(session?.user?.is_anonymous ?? false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsGuest(session?.user?.is_anonymous ?? false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: error.message === "Invalid login credentials" 
          ? "Неверный email или пароль" 
          : error.message,
      });
    } else {
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать!",
      });
      setEmail("");
      setPassword("");
    }

    setIsLoading(false);
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInAnonymously();

      if (error) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: error.message.includes("Anonymous sign-ins are disabled")
            ? "Гостевой вход временно недоступен"
            : "Не удалось войти как гость. Попробуйте позже.",
        });
      } else {
        toast({
          title: "Гостевой вход",
          description: "Вы вошли как гость. Позже вы сможете привязать аккаунт.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ошибка подключения",
        description: "Сервер временно недоступен. Попробуйте позже.",
      });
    }

    setIsLoading(false);
  };

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка привязки",
        description: error.message,
      });
    } else {
      toast({
        title: "Аккаунт привязан",
        description: "Ваш гостевой аккаунт успешно привязан!",
      });
      setEmail("");
      setPassword("");
      setIsGuest(false);
    }

    setIsLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
      });
    } else {
      toast({
        title: "Выход выполнен",
        description: "До скорой встречи!",
      });
    }
  };

  const navigate = (path: string) => window.location.href = path;

  const profileMenuItems = [
    { icon: BookOpen, label: "Моя библиотека", count: stats.booksRead, path: "/bookmarks" },
    { icon: History, label: "История чтения", path: "/history" },
    { icon: Heart, label: "Избранное", path: "/bookmarks" },
    { icon: Settings, label: "Настройки", onClick: () => setEditSheetOpen(true) },
  ];

  const settingsMenuItems = [
    { icon: UserIcon, label: "Аккаунт", key: "account" },
    { icon: UserPlus, label: "Регистрация", key: "registration" },
    { icon: ShieldCheck, label: "Конфиденциальность", key: "privacy" },
    { icon: Globe, label: "Язык приложения", key: "language" },
    { icon: HelpCircle, label: "Помощь", key: "help" },
  ];

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Пользователь";
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
    : null;

  // Logged in view
  if (user && !isGuest) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <ProfileHeader 
          title="Профиль" 
          onLogout={handleLogout}
          onEdit={() => setEditSheetOpen(true)}
          showEdit
        />

        <div className="p-4 space-y-6">
          {/* User Info Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card p-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative flex items-center gap-4">
              <ProfileAvatar 
                avatarUrl={profile?.avatar_url}
                displayName={displayName}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-xl truncate">{displayName}</h2>
                  <Crown size={18} className="text-primary flex-shrink-0" />
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                {memberSince && (
                  <p className="text-xs text-muted-foreground mt-1">
                    С нами с {memberSince}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.booksRead}</p>
              <p className="text-xs text-muted-foreground">Прочитано</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.chaptersRead}</p>
              <p className="text-xs text-muted-foreground">Глав</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.hoursRead}</p>
              <p className="text-xs text-muted-foreground">Часов</p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="bg-card rounded-2xl p-4">
            <ThemeToggle />
          </div>

          {/* Menu */}
          <div className="bg-card rounded-2xl overflow-hidden">
            {profileMenuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => item.onClick ? item.onClick() : item.path && navigate(item.path)}
                className={`w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors ${
                  index !== profileMenuItems.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.count !== undefined && (
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  )}
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
          {/* Settings Sections */}
          <div className="bg-card rounded-2xl overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Настройки</p>
            </div>
            {settingsMenuItems.map((item, index) => (
              <button
                key={item.key}
                onClick={() => setActiveSettingsSection(item.key)}
                className={`w-full flex items-center justify-between p-4 hover:bg-card-hover transition-colors ${
                  index !== settingsMenuItems.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Settings Section Sheet */}
        <Sheet open={!!activeSettingsSection} onOpenChange={(open) => !open && setActiveSettingsSection(null)}>
          <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle>
                {settingsMenuItems.find(i => i.key === activeSettingsSection)?.label}
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-center justify-center h-[calc(100%-100px)] text-center px-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {activeSettingsSection && (() => {
                  const Icon = settingsMenuItems.find(i => i.key === activeSettingsSection)?.icon;
                  return Icon ? <Icon size={32} className="text-primary" /> : null;
                })()}
              </div>
              <p className="text-lg font-semibold mb-2">Скоро будет доступно</p>
              <p className="text-sm text-muted-foreground">
                Этот раздел находится в разработке и будет доступен в ближайшем обновлении.
              </p>
            </div>
          </SheetContent>
        </Sheet>

        <ProfileEditSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          userId={user.id}
          userEmail={user.email || ""}
          onProfileUpdate={refetchProfile}
        />

        <BottomNavigation />
      </div>
    );
  }

  // Guest view with link account option
  if (user && isGuest) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <ProfileHeader title="Профиль" onLogout={handleLogout} />

        <div className="p-4 space-y-6">
          {/* Guest Info */}
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <UserCircle size={40} className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Гость</h2>
              <p className="text-sm text-muted-foreground">Привяжите аккаунт для сохранения данных</p>
            </div>
          </div>

          {/* Link Account Form */}
          <div className="bg-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon size={20} className="text-primary" />
              <h3 className="font-semibold">Привязать аккаунт</h3>
            </div>
            
            <form onSubmit={handleLinkAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-email">Email</Label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="link-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-password">Пароль</Label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="link-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Привязка..." : "Привязать аккаунт"}
              </Button>
            </form>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.booksRead}</p>
              <p className="text-xs text-muted-foreground">Прочитано</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.chaptersRead}</p>
              <p className="text-xs text-muted-foreground">Глав</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.hoursRead}</p>
              <p className="text-xs text-muted-foreground">Часов</p>
            </div>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Login view
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 glass-effect border-b border-border/50">
        <div className="px-4 py-3">
          <h1 className="font-semibold text-lg">Профиль</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Welcome */}
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <UserIcon size={40} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Добро пожаловать!</h2>
          <p className="text-muted-foreground text-sm">
            Войдите в аккаунт для синхронизации прогресса чтения
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl p-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <UserCircle size={18} className="mr-2" />
            Войти как гость
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Регистрация временно недоступна в тестовой версии
          </p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;

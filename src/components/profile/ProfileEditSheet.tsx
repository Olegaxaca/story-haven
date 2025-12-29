import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileAvatar } from "./ProfileAvatar";
import { User, Palette, Bell, Type, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  font_size: string;
  reading_direction: string;
  theme: string;
  email_notifications: boolean;
  reading_reminders: boolean;
  new_chapters_alert: boolean;
}

interface ProfileEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  onProfileUpdate: () => void;
}

const fontSizeOptions = [
  { value: "small", label: "Маленький", size: "text-sm" },
  { value: "medium", label: "Средний", size: "text-base" },
  { value: "large", label: "Большой", size: "text-lg" },
  { value: "xlarge", label: "Очень большой", size: "text-xl" },
];

const themeOptions = [
  { value: "system", label: "Системная" },
  { value: "dark", label: "Темная" },
  { value: "light", label: "Светлая" },
];

export const ProfileEditSheet = ({ 
  open, 
  onOpenChange, 
  userId, 
  userEmail,
  onProfileUpdate 
}: ProfileEditSheetProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    avatar_url: null,
    font_size: "medium",
    reading_direction: "ltr",
    theme: "system",
    email_notifications: true,
    reading_reminders: false,
    new_chapters_alert: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open && userId) {
      fetchProfile();
    }
  }, [open, userId]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setProfile({
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        font_size: data.font_size || "medium",
        reading_direction: data.reading_direction || "ltr",
        theme: data.theme || "system",
        email_notifications: data.email_notifications ?? true,
        reading_reminders: data.reading_reminders ?? false,
        new_chapters_alert: data.new_chapters_alert ?? true,
      });
    } else if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create it
      await supabase.from("profiles").insert({ user_id: userId });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const updateData: Partial<ProfileData> = {
        display_name: profile.display_name,
        font_size: profile.font_size,
        reading_direction: profile.reading_direction,
        theme: profile.theme,
        email_notifications: profile.email_notifications,
        reading_reminders: profile.reading_reminders,
        new_chapters_alert: profile.new_chapters_alert,
      };

      // Handle avatar upload if changed
      if (avatarFile) {
        // For now, we'll skip actual file upload since storage isn't set up
        // In production, you'd upload to Supabase Storage here
        toast({
          title: "Аватар",
          description: "Загрузка аватаров будет доступна в следующем обновлении",
        });
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Профиль обновлен",
        description: "Ваши изменения сохранены",
      });

      onProfileUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось сохранить изменения",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Редактирование профиля</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="profile" className="h-[calc(100%-80px)]">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="profile" className="gap-2">
              <User size={16} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="gap-2">
              <Type size={16} />
              <span className="hidden sm:inline">Чтение</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell size={16} />
              <span className="hidden sm:inline">Уведомления</span>
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto h-[calc(100%-120px)] pb-4">
            <TabsContent value="profile" className="space-y-6 mt-0">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <ProfileAvatar
                  avatarUrl={profile.avatar_url}
                  displayName={profile.display_name}
                  size="lg"
                  editable
                  onAvatarChange={setAvatarFile}
                />
                <p className="text-sm text-muted-foreground">
                  Нажмите для изменения аватара
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Отображаемое имя</Label>
                <Input
                  id="displayName"
                  placeholder="Ваше имя"
                  value={profile.display_name || ""}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={userEmail} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground">
                  Email нельзя изменить
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reading" className="space-y-6 mt-0">
              {/* Theme */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Palette size={16} />
                  Тема оформления
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setProfile({ ...profile, theme: option.value })}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        profile.theme === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card hover:bg-card-hover"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Type size={16} />
                  Размер шрифта
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setProfile({ ...profile, font_size: option.value })}
                      className={`p-3 rounded-xl font-medium transition-all ${option.size} ${
                        profile.font_size === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card hover:bg-card-hover"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Direction */}
              <div className="space-y-3">
                <Label>Направление чтения</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProfile({ ...profile, reading_direction: "ltr" })}
                    className={`p-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      profile.reading_direction === "ltr"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-card-hover"
                    }`}
                  >
                    <ArrowRight size={16} />
                    Слева направо
                  </button>
                  <button
                    onClick={() => setProfile({ ...profile, reading_direction: "rtl" })}
                    className={`p-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      profile.reading_direction === "rtl"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-card-hover"
                    }`}
                  >
                    <ArrowLeft size={16} />
                    Справа налево
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Для манги рекомендуется направление справа налево
                </p>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card rounded-xl">
                  <div>
                    <p className="font-medium">Email уведомления</p>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления на почту
                    </p>
                  </div>
                  <Switch
                    checked={profile.email_notifications}
                    onCheckedChange={(checked) => 
                      setProfile({ ...profile, email_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-card rounded-xl">
                  <div>
                    <p className="font-medium">Напоминания о чтении</p>
                    <p className="text-sm text-muted-foreground">
                      Напоминать о незаконченных книгах
                    </p>
                  </div>
                  <Switch
                    checked={profile.reading_reminders}
                    onCheckedChange={(checked) => 
                      setProfile({ ...profile, reading_reminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-card rounded-xl">
                  <div>
                    <p className="font-medium">Новые главы</p>
                    <p className="text-sm text-muted-foreground">
                      Уведомлять о новых главах
                    </p>
                  </div>
                  <Switch
                    checked={profile.new_chapters_alert}
                    onCheckedChange={(checked) => 
                      setProfile({ ...profile, new_chapters_alert: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              onClick={handleSave} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

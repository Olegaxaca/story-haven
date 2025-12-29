import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  font_size: string;
  reading_direction: string;
  theme: string;
  email_notifications: boolean;
  reading_reminders: boolean;
  new_chapters_alert: boolean;
}

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setProfile(data as Profile);
    } else if (error?.code === "PGRST116") {
      // Profile doesn't exist, create it
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (newProfile) {
        setProfile(newProfile as Profile);
      }
    }
    
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, refetch: fetchProfile };
};

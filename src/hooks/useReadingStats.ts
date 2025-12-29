import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReadingStats {
  booksRead: number;
  chaptersRead: number;
  hoursRead: number;
}

export const useReadingStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<ReadingStats>({
    booksRead: 0,
    chaptersRead: 0,
    hoursRead: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get reading progress data
        const { data: progressData } = await supabase
          .from("reading_progress")
          .select("content_id, chapter_number, total_chapters")
          .eq("user_id", userId);

        if (progressData) {
          // Count unique books
          const uniqueBooks = new Set(progressData.map(p => p.content_id));
          
          // Sum all chapters read
          const totalChapters = progressData.reduce((sum, p) => sum + (p.chapter_number || 0), 0);
          
          // Estimate hours (rough estimate: 5 minutes per chapter)
          const estimatedHours = Math.round(totalChapters * 5 / 60);

          setStats({
            booksRead: uniqueBooks.size,
            chaptersRead: totalChapters,
            hoursRead: estimatedHours,
          });
        }
      } catch (error) {
        console.error("Error fetching reading stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, isLoading };
};

import { useState } from "react";
import { SearchHeader } from "@/components/SearchHeader";
import { CategoryTabs } from "@/components/CategoryTabs";
import { FeaturedHero } from "@/components/FeaturedHero";
import { ContentSection } from "@/components/ContentSection";
import { ContinueReading } from "@/components/ContinueReading";
import { BottomNavigation } from "@/components/BottomNavigation";

// Import cover images
import featuredCover from "@/assets/covers/featured-1.jpg";
import manga1 from "@/assets/covers/manga-1.jpg";
import manga2 from "@/assets/covers/manga-2.jpg";
import manga3 from "@/assets/covers/manga-3.jpg";
import comics1 from "@/assets/covers/comics-1.jpg";
import fanfic1 from "@/assets/covers/fanfic-1.jpg";
import book2 from "@/assets/covers/book-2.jpg";
import book3 from "@/assets/covers/book-3.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("all");

  const featuredContent = {
    cover: featuredCover,
    title: "Врата Пламени",
    description: "Древний мир, полный магии и опасностей. Молодой искатель приключений обнаруживает таинственные врата, которые могут изменить судьбу всего королевства...",
    rating: 4.8,
    chapters: 342,
    type: "Фэнтези",
  };

  const continueReadingItems = [
    {
      id: "1",
      cover: manga1,
      title: "Герой Бури",
      chapter: "Глава 156: Последняя битва",
      progress: 73,
      type: "manga" as const,
    },
    {
      id: "2",
      cover: book2,
      title: "Тёмная Волшебница",
      chapter: "Глава 42: Секреты прошлого",
      progress: 45,
      type: "book" as const,
    },
  ];

  const popularBooks = [
    { id: "b1", cover: featuredCover, title: "Врата Пламени", author: "А. Петров", rating: 4.8, type: "book" as const, chapters: 342, isHot: true },
    { id: "b2", cover: book2, title: "Тёмная Волшебница", author: "М. Иванова", rating: 4.6, type: "book" as const, chapters: 215 },
    { id: "b3", cover: book3, title: "Последний Драконоборец", author: "И. Сидоров", rating: 4.9, type: "book" as const, chapters: 428, isNew: true },
    { id: "b4", cover: fanfic1, title: "Звёздные Любовники", author: "Е. Смирнова", rating: 4.5, type: "book" as const, chapters: 156 },
  ];

  const hotManga = [
    { id: "m1", cover: manga1, title: "Герой Бури", rating: 4.9, type: "manga" as const, chapters: 245, isHot: true },
    { id: "m2", cover: manga2, title: "Кибер-Тень", rating: 4.7, type: "manga" as const, chapters: 178, isNew: true },
    { id: "m3", cover: manga3, title: "Приключения Академии", rating: 4.5, type: "manga" as const, chapters: 89 },
    { id: "m4", cover: manga1, title: "Воин Луны", rating: 4.8, type: "manga" as const, chapters: 312 },
  ];

  const newComics = [
    { id: "c1", cover: comics1, title: "Ночной Страж", rating: 4.6, type: "comics" as const, chapters: 56, isNew: true },
    { id: "c2", cover: comics1, title: "Тёмный Мститель", rating: 4.4, type: "comics" as const, chapters: 78 },
    { id: "c3", cover: book3, title: "Герои Завтрашнего Дня", rating: 4.7, type: "comics" as const, chapters: 124, isHot: true },
  ];

  const topFanfics = [
    { id: "f1", cover: fanfic1, title: "Лунный Свет", author: "KittyWriter", rating: 4.8, type: "fanfic" as const, chapters: 67, isHot: true },
    { id: "f2", cover: fanfic1, title: "Второй Шанс", author: "DreamCatcher", rating: 4.5, type: "fanfic" as const, chapters: 134 },
    { id: "f3", cover: book2, title: "Тени Прошлого", author: "NightOwl", rating: 4.6, type: "fanfic" as const, chapters: 89, isNew: true },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <SearchHeader />

      {/* Featured Hero */}
      <FeaturedHero {...featuredContent} />

      {/* Category Tabs */}
      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      {/* Continue Reading */}
      <ContinueReading items={continueReadingItems} />

      {/* Content Sections */}
      <ContentSection title="Популярные книги" items={popularBooks} />
      <ContentSection title="Горячая манга" items={hotManga} />
      <ContentSection title="Новые комиксы" items={newComics} />
      <ContentSection title="Топ фанфиков" items={topFanfics} />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

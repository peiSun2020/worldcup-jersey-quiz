import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import GameContainer from "@/components/game/GameContainer";
import FAQ from "@/components/seo/FAQ";
import SEOContent from "@/components/seo/SEOContent";
import Leaderboard from "@/components/social/Leaderboard";
import CommentWall from "@/components/social/CommentWall";
import ShareButton from "@/components/social/ShareButton";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex-1">
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Hero + Game Area */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <GameSection />
      </section>

      {/* SEO Content - Server rendered, important for crawlers */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <SEOContent />
      </section>

      {/* UGC Section - Client rendered to avoid keyword pollution */}
      <section className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Leaderboard />
        <CommentWall />
      </section>

      {/* FAQ - SEO value, covers long-tail keywords */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <FAQ />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

function AnnouncementBanner() {
  const t = useTranslations("announcement");
  return (
    <div className="bg-gradient-to-r from-green-700 to-green-600 text-white text-center py-2 px-4 text-sm font-medium">
      🏆 {t("text")}
    </div>
  );
}

function GameSection() {
  const t = useTranslations("game");
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
        {t("title")}
      </h1>
      <GameContainer />
      <div className="mt-6 flex justify-center">
        <ShareButton />
      </div>
    </div>
  );
}

function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
            {t("about")}
          </a>
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
            {t("privacy")}
          </a>
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
            {t("terms")}
          </a>
          <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">
            {t("contact")}
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} World Cup Jersey Quiz</p>
      </div>
    </footer>
  );
}

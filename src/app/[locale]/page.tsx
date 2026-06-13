import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import GameContainer from "@/components/game/GameContainer";
import FAQ from "@/components/seo/FAQ";
import SEOContent from "@/components/seo/SEOContent";
import Leaderboard from "@/components/social/Leaderboard";
import CommentWall from "@/components/social/CommentWall";
import ShareButton from "@/components/social/ShareButton";
import { locales } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  zh: "中文",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
  ru: "Русский",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "faq" });

  // Build FAQ structured data
  const faqItems = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
  ];

  const siteT = await getTranslations({ locale, namespace: "site" });

  // JSON-LD: WebApplication + FAQPage structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: siteT("title"),
        description: siteT("description"),
        url: `${SITE_URL}/${locale}`,
        applicationCategory: "GameApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        inLanguage: locale,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };

  return (
    <main className="flex-1">
      {/* Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Language Switcher - Internal links for SEO */}
      <LanguageSwitcher currentLocale={locale} />

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
      <Footer currentLocale={locale} />
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

function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  return (
    <nav
      aria-label="Language selection"
      className="max-w-5xl mx-auto px-4 pt-4 flex justify-end gap-2 flex-wrap"
    >
      {locales.map((l) => (
        <a
          key={l}
          href={`/${l}`}
          hrefLang={l}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            l === currentLocale
              ? "bg-green-700 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {LANGUAGE_NAMES[l] || l}
        </a>
      ))}
    </nav>
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

function Footer({ currentLocale }: { currentLocale: string }) {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Internal links to all language versions - SEO value */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {locales.map((l) => (
            <a
              key={l}
              href={`/${l}`}
              hrefLang={l}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {LANGUAGE_NAMES[l] || l}
            </a>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
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
      </div>
    </footer>
  );
}

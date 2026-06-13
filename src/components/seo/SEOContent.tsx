import { useTranslations } from "next-intl";

/**
 * SEO Content Section
 * This is SERVER-RENDERED and crawled by search engines.
 * Keep your main keywords here. Do NOT put UGC content in this component.
 */
export default function SEOContent() {
  const t = useTranslations("site");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-4">{t("tagline")}</h2>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {t("description")}
        </p>
        {/*
          ADD YOUR SEO CONTENT HERE
          - Include your main keywords naturally
          - Add relevant context about your game/tool
          - Keep it helpful and informative for users
          - This section is server-rendered and indexed by Google
        */}
      </div>
    </div>
  );
}

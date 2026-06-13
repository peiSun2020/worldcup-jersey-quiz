import { useTranslations } from "next-intl";

/**
 * SEO Content Section
 * SERVER-RENDERED - crawled by search engines.
 * Keep main keywords here. Do NOT put UGC content in this component.
 */
export default function SEOContent() {
  const t = useTranslations("site");
  const tGame = useTranslations("game");
  const tFaq = useTranslations("faq");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-4">{t("tagline")}</h2>
      <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
        <p>{t("description")}</p>
        <p>{tFaq("a1")}</p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pt-2">
          {tFaq("q4")}
        </h3>
        <p>{tFaq("a4")}</p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pt-2">
          {tFaq("q6")}
        </h3>
        <p>{tFaq("a6")}</p>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function FAQ() {
  const t = useTranslations("faq");

  const questions = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>
      <div className="space-y-3">
        {questions.map((item, i) => (
          <FAQItem key={i} question={item.q} answer={item.a} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-medium pr-4">{question}</span>
        <span className="text-gray-400 flex-shrink-0 text-xl">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3 text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

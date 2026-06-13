"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback, useMemo } from "react";
import { GameEvents } from "@/lib/analytics";

/**
 * World Cup 2026 Jersey Color Quiz
 * Guess the primary home jersey color of World Cup teams.
 */

interface Team {
  name: string;
  color: string;
  group: string;
}

const TEAMS: Team[] = [
  // Group A
  { name: "Argentina", color: "#75B4E8", group: "A" },
  { name: "Morocco", color: "#C1272D", group: "A" },
  { name: "Ecuador", color: "#FFD100", group: "A" },
  { name: "Curaçao", color: "#003DA5", group: "A" },
  // Group B
  { name: "Brazil", color: "#FFDF00", group: "B" },
  { name: "Colombia", color: "#FCD116", group: "B" },
  { name: "Japan", color: "#002FA7", group: "B" },
  { name: "Paraguay", color: "#CE1126", group: "B" },
  // Group C
  { name: "United States", color: "#BF0A30", group: "C" },
  { name: "England", color: "#FFFFFF", group: "C" },
  { name: "Panama", color: "#DA121A", group: "C" },
  { name: "Bosnia and Herzegovina", color: "#002395", group: "C" },
  // Group D
  { name: "France", color: "#002654", group: "D" },
  { name: "Uzbekistan", color: "#F5F5F5", group: "D" },
  { name: "Haiti", color: "#00209F", group: "D" },
  { name: "South Korea", color: "#C60C30", group: "D" },
  // Group E
  { name: "Spain", color: "#CE1126", group: "E" },
  { name: "Netherlands", color: "#FF6600", group: "E" },
  { name: "Australia", color: "#FFCD00", group: "E" },
  { name: "Ivory Coast", color: "#FF8200", group: "E" },
  // Group F
  { name: "Portugal", color: "#DA291C", group: "F" },
  { name: "Uruguay", color: "#7BB3E0", group: "F" },
  { name: "Türkiye", color: "#E30A17", group: "F" },
  { name: "Egypt", color: "#C41E3A", group: "F" },
  // Group G
  { name: "Mexico", color: "#F0F0F0", group: "G" },
  { name: "Canada", color: "#FF0000", group: "G" },
  { name: "Senegal", color: "#00853F", group: "G" },
  { name: "South Africa", color: "#FFB81C", group: "G" },
  // Group H
  { name: "Germany", color: "#1A1A1A", group: "H" },
  { name: "Scotland", color: "#003082", group: "H" },
  { name: "Ghana", color: "#1A1A1A", group: "H" },
  { name: "Iraq", color: "#F5F5F5", group: "H" },
  // Group I
  { name: "Croatia", color: "#ED1C24", group: "I" },
  { name: "Sweden", color: "#FECC02", group: "I" },
  { name: "Cape Verde", color: "#FFD100", group: "I" },
  { name: "Qatar", color: "#8A1538", group: "I" },
  // Group J
  { name: "Belgium", color: "#ED2939", group: "J" },
  { name: "Iran", color: "#F5F5F5", group: "J" },
  { name: "Norway", color: "#EF2B2D", group: "J" },
  { name: "Czechia", color: "#D7141A", group: "J" },
  // Group K
  { name: "Switzerland", color: "#FF0000", group: "K" },
  { name: "Austria", color: "#ED2939", group: "K" },
  { name: "Tunisia", color: "#E8E8E8", group: "K" },
  { name: "Jordan", color: "#F5F5F5", group: "K" },
  // Group L
  { name: "Saudi Arabia", color: "#006233", group: "L" },
  { name: "New Zealand", color: "#1A1A1A", group: "L" },
  { name: "Haiti", color: "#00209F", group: "L" },
  { name: "Cape Verde", color: "#FFD100", group: "L" },
];

// Remove duplicates by name
const UNIQUE_TEAMS = TEAMS.filter(
  (team, index, self) => index === self.findIndex((t) => t.name === team.name)
);

function generateOptions(correctColor: string): string[] {
  const options = [correctColor];
  const hsl = hexToHSL(correctColor);

  // Generate 3 wrong colors that are plausibly "team colors"
  const offsets = [40, 80, 160];
  for (const offset of offsets) {
    const newHue = (hsl.h + offset) % 360;
    const newSat = Math.max(30, Math.min(100, hsl.s + (Math.random() * 20 - 10)));
    const newLight = Math.max(20, Math.min(80, hsl.l + (Math.random() * 15 - 7)));
    options.push(hslToHex(newHue, newSat, newLight));
  }

  return options.sort(() => Math.random() - 0.5);
}

function hexToHSL(hex: string) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  if (hex.length < 7) {
    r = g = b = 0.9; // fallback for short/white colors
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type GameState = "idle" | "playing" | "result" | "gameover";

export default function GameContainer() {
  const t = useTranslations("game");
  const [state, setState] = useState<GameState>("idle");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentTeam, setCurrentTeam] = useState(UNIQUE_TEAMS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [streak, setStreak] = useState(0);

  const totalTeams = UNIQUE_TEAMS.length;

  const startGame = useCallback(() => {
    setState("playing");
    setScore(0);
    setRound(1);
    setLives(3);
    setStreak(0);
    const newUsed = new Set<number>();
    setUsedIndices(newUsed);
    pickNextTeam(newUsed);
    GameEvents.gameStart();
  }, []);

  function pickNextTeam(used: Set<number>) {
    const available = UNIQUE_TEAMS.map((_, i) => i).filter((i) => !used.has(i));
    if (available.length === 0) {
      setState("gameover");
      GameEvents.gameComplete(score);
      return;
    }

    const idx = available[Math.floor(Math.random() * available.length)];
    const newUsed = new Set(used);
    newUsed.add(idx);
    setUsedIndices(newUsed);

    const team = UNIQUE_TEAMS[idx];
    setCurrentTeam(team);
    setOptions(generateOptions(team.color));
    setSelected(null);
    setIsCorrect(false);
    setState("playing");
  }

  function handlePick(color: string) {
    if (selected) return;
    setSelected(color);

    const correct = color === currentTeam.color;
    setIsCorrect(correct);

    if (correct) {
      const streakBonus = streak >= 3 ? 5 : streak >= 5 ? 10 : 0;
      setScore((s) => s + 10 + streakBonus);
      setStreak((s) => s + 1);
      setState("result");
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setState("gameover");
        GameEvents.gameComplete(score);
      } else {
        setState("result");
      }
    }
  }

  function handleNext() {
    setRound((r) => r + 1);
    pickNextTeam(usedIndices);
  }

  // Render lives as soccer balls
  const livesDisplay = "⚽".repeat(lives);

  return (
    <div className="flex flex-col items-center gap-6">
      {state === "idle" && (
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
            FIFA World Cup 2026
          </p>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            {t("subtitle")}
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {t("start")}
          </button>
        </div>
      )}

      {state === "playing" && (
        <div className="text-center w-full max-w-md">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>{t("round", { round })}</span>
            <span>{livesDisplay}</span>
            <span>
              {t("score")}: {score}
            </span>
          </div>

          {streak >= 3 && (
            <div className="text-orange-500 text-sm font-medium mb-2">
              🔥 {streak} {t("streak")}
            </div>
          )}

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">{t("group")} {currentTeam.group}</p>
            <p className="text-2xl font-bold">{currentTeam.name}</p>
            <p className="text-sm text-gray-500 mt-1">{t("pickColor")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((color, i) => (
              <button
                key={i}
                onClick={() => handlePick(color)}
                className="aspect-[3/2] rounded-2xl border-4 border-transparent hover:border-indigo-300 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 relative overflow-hidden"
                style={{ backgroundColor: color }}
                aria-label={`Color option ${i + 1}`}
              >
                {/* Jersey-like collar detail */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 rounded-b-full"
                  style={{
                    backgroundColor:
                      color === "#FFFFFF" || color === "#F5F5F5" || color === "#F0F0F0" || color === "#E8E8E8"
                        ? "#ddd"
                        : "rgba(255,255,255,0.3)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {state === "result" && (
        <div className="text-center">
          {isCorrect ? (
            <p className="text-2xl font-bold text-green-500 mb-2">
              ⚽ {t("correct")}
            </p>
          ) : (
            <p className="text-2xl font-bold text-red-500 mb-2">
              ❌ {t("wrong")}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div
                className="w-20 h-14 rounded-lg shadow-lg border"
                style={{ backgroundColor: currentTeam.color }}
              />
              <p className="text-xs text-gray-500 mt-1">{currentTeam.name}</p>
            </div>
          </div>

          {!isCorrect && (
            <p className="text-sm text-gray-500 mb-2">
              {livesDisplay} {t("livesLeft", { lives })}
            </p>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
          >
            {t("nextRound")}
          </button>
        </div>
      )}

      {state === "gameover" && (
        <div className="text-center">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-2xl font-bold mb-2">{t("gameOver")}</p>
          <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            {score}
          </p>
          <p className="text-gray-500 mb-1">
            {t("yourScore", { score: String(score) })}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {t("teamsGuessed", { count: round - 1, total: totalTeams })}
          </p>

          <button
            onClick={startGame}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {t("playAgain")}
          </button>
        </div>
      )}
    </div>
  );
}

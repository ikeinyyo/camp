import type { DailyGames } from "@/config/daily-games";

function options(value: FormDataEntryValue | null) {
  return String(value ?? "").split("\n").map((option) => option.trim()).filter(Boolean);
}

export function dailyGamesFromForm(data: FormData): DailyGames {
  return {
    date: String(data.get("date") ?? ""),
    trivia: {
      prompt: String(data.get("triviaPrompt") ?? ""),
      options: options(data.get("triviaOptions")),
      correctOption: Number(data.get("triviaCorrect")) - 1,
      explanation: String(data.get("triviaExplanation") ?? "").trim() || undefined,
    },
    word: {
      prompt: String(data.get("wordPrompt") ?? ""),
      answer: String(data.get("wordAnswer") ?? ""),
      hint: String(data.get("wordHint") ?? "").trim() || undefined,
      explanation: String(data.get("wordExplanation") ?? "").trim() || undefined,
    },
    poll: {
      prompt: String(data.get("pollPrompt") ?? ""),
      options: options(data.get("pollOptions")),
    },
  };
}

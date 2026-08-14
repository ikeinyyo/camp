import type { ActivityInput } from "./activities";

const days = { friday: { date: "Viernes 28 de agosto", shortDate: "Vie 28" }, saturday: { date: "Sábado 29 de agosto", shortDate: "Sáb 29" }, sunday: { date: "Domingo 30 de agosto", shortDate: "Dom 30" } } as const;

export function activityInputFromForm(formData: FormData): ActivityInput {
  const dayId = String(formData.get("dayId")) as keyof typeof days;
  if (!days[dayId]) throw new Error("Día no válido.");
  return { dayId, ...days[dayId], start: String(formData.get("start") ?? ""), end: String(formData.get("end") ?? ""), title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), location: String(formData.get("location") ?? ""), required: formData.get("required") === "true", participationPoints: Number(formData.get("participationPoints")), firstPoints: Number(formData.get("firstPoints")), secondPoints: Number(formData.get("secondPoints")), thirdPoints: Number(formData.get("thirdPoints")), active: formData.get("active") === "true" };
}

export type VoucherCategory = "organization" | "collaboration" | "activities";

export const VOUCHER_CATEGORIES: ReadonlyArray<{ id: VoucherCategory; name: string; description: string }> = [
  { id: "organization", name: "Organización", description: "Tareas para preparar, ordenar y mantener en marcha los espacios y las comidas." },
  { id: "collaboration", name: "Colaboración", description: "Pequeñas ayudas para cuidar a la familia y repartir mejor el trabajo entre todos." },
  { id: "activities", name: "Actividades", description: "Apoyo durante los juegos, concursos y demás actividades de la Gallardo Camp." },
];

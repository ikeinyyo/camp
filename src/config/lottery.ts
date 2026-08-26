export const LOTTERY_PRIZES = [1, 2, 3, 5, 10] as const;

// Cada posición ocupa el mismo espacio en la ruleta. Repetir un premio define su peso.
export const LOTTERY_PRIZE_SLOTS = [3, 2, 5, 3, 1, 3, 5, 2, 3, 10, 5, 2, 3] as const;

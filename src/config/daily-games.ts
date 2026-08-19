export type DailyGameKind = "trivia" | "word" | "poll";

export type ChoiceChallenge = { prompt: string; options: string[]; correctOption: number; explanation?: string };
export type WordChallenge = { prompt: string; answer: string; hint?: string; explanation?: string };
export type PollChallenge = { prompt: string; options: string[] };
export type DailyGames = { date: string; trivia: ChoiceChallenge; word: WordChallenge; poll: PollChallenge };

/** Configuración predeterminada. Azure puede sobrescribir cualquier fecha desde administración. */
export const DAILY_GAMES: DailyGames[] = [
  {
    date: "2026-08-21",
    trivia: { prompt: "¿En qué localidad se celebra la Gallardo Camp 2026?", options: ["La Romana", "Novelda", "Aspe", "Monóvar"], correctOption: 0, explanation: "La Gallardo Camp 2026 se celebra en La Romana." },
    word: { prompt: "La palabra de hoy representa lo más importante de la Gallardo Camp.", answer: "FAMILIA", hint: "Somos muchos, discutimos un poco y siempre volvemos a juntarnos." },
    poll: { prompt: "¿Qué actividad esperas con más ganas?", options: ["Concurso de tapas", "Concurso de talentos", "Bingo", "Campeonato de dominó"] },
  },
  {
    date: "2026-08-22",
    trivia: { prompt: "¿En qué año nació el yayo?", options: ["1941", "1943", "1945", "1947"], correctOption: 1, explanation: "El yayo nació en 1943." },
    word: { prompt: "El apellido que da nombre a nuestro evento.", answer: "GALLARDO", hint: "Está en el nombre de la Camp." },
    poll: { prompt: "¿Qué momento del día prefieres para las actividades?", options: ["Mañana", "Mediodía", "Tarde", "Noche"] },
  },
  {
    date: "2026-08-23",
    trivia: { prompt: "¿Qué era el salón de abajo en el campo antes de la reforma?", options: ["Baño", "Cochera", "Trastero", "Cocina"], correctOption: 1, explanation: "Antes de la reforma era una cochera." },
    word: { prompt: "País al que emigró la yaya.", answer: "BÉLGICA", hint: "Un país europeo conocido por el chocolate y los gofres." },
    poll: { prompt: "¿Qué desayuno elegirías para empezar un día de Gallardo Camp?", options: ["Churros con chocolate", "Tostadas", "Bollería", "Algo salado"] },
  },
  {
    date: "2026-08-24",
    trivia: { prompt: "¿Dónde se fue Nicole de acampada y la pillaron los yayos?", options: ["Al faro", "A la playa", "A la pinada", "A la montaña"], correctOption: 0, explanation: "Se fue de acampada al faro." },
    word: { prompt: "Pedanía de Lorca en la que nació el yayo.", answer: "ZUÑIGA", hint: "Está ubicada en la zona noreste del municipio de Lorca." },
    poll: { prompt: "¿Qué actividad prefieres para pasar el tiempo?", options: ["Móvil", "Juegos de mesa", "Leer", "Cocinar"] },
  },
  {
    date: "2026-08-25",
    trivia: { prompt: "¿Quién dijo: «Invisible te voy a poner yo a ti»?", options: ["El yayo", "La yaya", "Sergio", "Juan Carlos"], correctOption: 0, explanation: "La frase es del yayo." },
    word: { prompt: "Completa el nombre de la calle donde vivían los yayos cuando se casaron: ____ Santa María.", answer: "FERNANDA", hint: "Es un nombre propio femenino." },
    poll: { prompt: "¿Cómo debería ser la tapa ganadora?", options: ["Tradicional", "Innovadora", "Picante", "Con mucho queso"] },
  },
  {
    date: "2026-08-26",
    trivia: { prompt: "¿En qué año nació la yaya?", options: ["1947", "1948", "1949", "1950"], correctOption: 2, explanation: "La yaya nació en 1949." },
    word: { prompt: "Juan Carlos es el ____ de su madre.", answer: "FAVORITO", hint: "El elegido por encima de los demás… supuestamente." },
    poll: { prompt: "¿Qué estilo no puede faltar en el karaoke?", options: ["Pop", "Rock", "Copla", "Reguetón"] },
  },
  {
    date: "2026-08-27",
    trivia: { prompt: "¿Qué tatuaje hizo Juan para el brazo de Sergio?", options: ["Reactor ARK", "Mjolnir", "Escudo del Capitán América", "Ojo de Agamotto"], correctOption: 0, explanation: "Juan hizo el Reactor ARK para el brazo de Sergio." },
    word: { prompt: "Sergio la usa para referirse a algo malo, que da asco o que no mola nada.", answer: "PONZOÑA", hint: "Una palabra muy de Sergio." },
    poll: { prompt: "¿Qué añadirías a la próxima Gallardo Camp?", options: ["Más juegos", "Más comida", "Más música", "Una noche más"] },
  },
  {
    date: "2026-08-28",
    trivia: { prompt: "Cuando nació Alberto, la empresa de Sergio le regaló un cuadro que ponía…", options: ["Little Gallardo", "Gallardo Junior", "Gallardito", "Gallargdo"], correctOption: 2, explanation: "En el cuadro ponía «Gallardito»." },
    word: { prompt: "Otro apellido protagonista del evento; con él también empezó todo.", answer: "SALES", hint: "Cinco letras y mucha historia familiar." },
    poll: { prompt: "¿Qué necesita la pista polideportiva?", options: ["Más puertas", "Arreglar la valla", "Hacer la valla más alta", "Todo lo anterior"] },
  },
  {
    date: "2026-08-29",
    trivia: { prompt: "¿Qué animal era Butragueño, tristemente fallecido?", options: ["Un perro", "Un gato", "Un hámster", "Un conejillo de Indias"], correctOption: 2, explanation: "Butragueño era un hámster." },
    word: { prompt: "La última actividad de este sábado en la Gallardo Camp.", answer: "BINGO", hint: "Cada familia ha preparado cinco regalos para jugar." },
    poll: { prompt: "¿Cuántos postres te gustaría que hiciera la yaya?", options: ["Uno es suficiente", "2", "3", "Los máximos posibles"] },
  },
  {
    date: "2026-08-30",
    trivia: { prompt: "¿Con qué ficha de dominó sueña constantemente el yayo?", options: ["4 doble", "6 doble", "3/4", "Blanca doble"], correctOption: 0, explanation: "El yayo sueña constantemente con el 4 doble." },
    word: { prompt: "El campeonato que cierra la competición del domingo.", answer: "DOMINÓ", hint: "Se juega colocando fichas con puntos." },
    poll: { prompt: "¿Qué premio te haría más ilusión ganar?", options: ["Un set de LEGO", "Un llavero", "Unos cascos inalámbricos", "Un juego de mesa"] },
  },
];

export function getMadridDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function getDailyGames(date: string) {
  return DAILY_GAMES.find((games) => games.date === date);
}

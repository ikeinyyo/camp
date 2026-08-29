export type ScheduleEvent = {
  id: string;
  start: string;
  end: string;
  title: string;
  description: string;
  location: string;
  required: boolean;
  participationPoints: number;
  podiumPoints?: {
    first: number;
    second: number;
    third: number;
  };
};

export type ScheduleDay = {
  id: string;
  isoDate: string;
  date: string;
  shortDate: string;
  events: ScheduleEvent[];
};

export const schedule: ScheduleDay[] = [
  {
    id: "friday",
    isoDate: "2026-08-28",
    date: "Viernes 28 de agosto",
    shortDate: "Vie 28",
    events: [
      {
        id: "karaoke",
        start: "23:00",
        end: "00:30",
        title: "Karaoke",
        description:
          "Abrimos el Gallardo Camp con canciones, dúos improvisados y actuaciones sin demasiada presión. No hace falta cantar bien: basta con elegir un tema, animarse a salir y apoyar al resto de la familia.",
        location: "Plaza Central",
        required: false,
        participationPoints: 5,
      },
    ],
  },
  {
    id: "saturday",
    isoDate: "2026-08-29",
    date: "Sábado 29 de agosto",
    shortDate: "Sáb 29",
    events: [
      {
        id: "saturday-breakfast",
        start: "09:30",
        end: "11:00",
        title: "Desayuno en La Romana",
        description:
          "Empezamos la jornada del sábado con toda la familia reunida alrededor de la mesa. Será el momento de coger fuerzas, comentar el karaoke de la noche anterior y repasar juntos el plan del día.",
        location: "El Mirador",
        required: false,
        participationPoints: 5,
      },
      {
        id: "tapas-lunch",
        start: "13:00",
        end: "15:30",
        title: "Concurso de tapas",
        description:
          "Degustaremos todas las tapas preparadas y elegiremos nuestras favoritas. La competición importa, pero el objetivo principal será compartir la comida y pasarlo bien.",
        location: "Pinada sur",
        required: true,
        participationPoints: 5,
        podiumPoints: { first: 15, second: 10, third: 5 },
      },
      {
        id: "talent-show",
        start: "18:30",
        end: "20:30",
        title: "Concurso de talentos",
        description:
          "El concurso puede afrontarse de forma individual o en grupo. Valen actuaciones, trucos, música, humor o cualquier habilidad capaz de sorprender al jurado y al resto de la familia.",
        location: "Plaza Central",
        required: false,
        participationPoints: 5,
        podiumPoints: { first: 15, second: 10, third: 5 },
      },
      {
        id: "saturday-dinner",
        start: "21:00",
        end: "22:30",
        title: "Cena en el Campo",
        description:
          "Cena familiar para descansar después de los juegos y comentar las mejores jugadas del día. Aprovecharemos también para preparar las actividades de la noche.",
        location: "Plaza Central",
        required: true,
        participationPoints: 0,
      },
      {
        id: "bingo",
        start: "22:30",
        end: "00:00",
        title: "Bingo",
        description:
          "Cada familia debe llevar cinco artículos envueltos que se puedan aprovechar y tengan algún valor. Los premios permanecerán ocultos hasta que sus nuevos dueños los consigan durante el bingo.",
        location: "Plaza Central",
        required: true,
        participationPoints: 5,
      },
    ],
  },
  {
    id: "sunday",
    isoDate: "2026-08-30",
    date: "Domingo 30 de agosto",
    shortDate: "Dom 30",
    events: [
      {
        id: "stretching-workshop",
        start: "09:15",
        end: "10:30",
        title: "Taller de estiramiento",
        description:
          "Empezaremos el domingo activando el cuerpo con una sesión suave de movilidad y estiramientos. Cada participante debe traer una toalla o esterilla para realizar los ejercicios con comodidad.",
        location: "Cenador",
        required: false,
        participationPoints: 5,
      },
      {
        id: "sunday-breakfast",
        start: "10:30",
        end: "12:00",
        title: "Desayuno de churros con chocolate",
        description:
          "Desayuno tranquilo con churros y chocolate caliente para recuperar fuerzas. Repasaremos la clasificación y presentaremos las últimas actividades del domingo.",
        location: "Pinada Oeste",
        required: false,
        participationPoints: 0,
      },
      {
        id: "sunday-lunch",
        start: "14:00",
        end: "15:30",
        title: "Comida",
        description:
          "Comida familiar del domingo antes de afrontar la recta final del evento. Será un rato relajado para descansar, comentar la clasificación y prepararnos para el campeonato de dominó.",
        location: "Pinada sur",
        required: true,
        participationPoints: 0,
      },
      {
        id: "domino-championship",
        start: "18:00",
        end: "19:30",
        title: "Campeonato de dominó",
        description:
          "Cerraremos la competición con un campeonato de dominó para medir estrategia, memoria y sangre fría. Las mejores posiciones sumarán puntos extra antes de despedir el Gallardo Camp.",
        location: "Plaza Central",
        required: false,
        participationPoints: 5,
        podiumPoints: { first: 15, second: 10, third: 5 },
      },
      {
        id: "closing-ceremony",
        start: "19:30",
        end: "20:45",
        title: "Cierre y entrega de premios",
        description:
          "Ceremonia final del Gallardo Camp para repasar los mejores momentos, anunciar la clasificación definitiva y entregar los premios a los equipos y participantes destacados.",
        location: "Plaza Central",
        required: true,
        participationPoints: 0,
      },
    ],
  },
];

import { describe, expect, it } from "vitest";
import { schedule } from "./schedule";

describe("schedule configuration", () => {
  it("contiene los tres días del evento", () => {
    expect(schedule.map((day) => day.date)).toEqual([
      "Viernes 28 de agosto",
      "Sábado 29 de agosto",
      "Domingo 30 de agosto",
    ]);
  });

  it("asocia cada jornada con su fecha del calendario", () => {
    expect(schedule.map((day) => day.isoDate)).toEqual([
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
    ]);
  });

  it("define todos los detalles necesarios para cada actividad", () => {
    for (const day of schedule) {
      for (const event of day.events) {
        expect(event).toMatchObject({
          id: expect.any(String),
          start: expect.stringMatching(/^\d{2}:\d{2}$/),
          end: expect.stringMatching(/^\d{2}:\d{2}$/),
          title: expect.any(String),
          description: expect.any(String),
          location: expect.any(String),
          required: expect.any(Boolean),
          participationPoints: expect.any(Number),
        });
      }
    }
  });

  it("excluye de la puntuación las comidas indicadas", () => {
    const eventsWithoutPoints = schedule
      .flatMap((day) => day.events)
      .filter((event) => event.participationPoints === 0);

    expect(eventsWithoutPoints.map((event) => event.id)).toEqual([
      "saturday-dinner",
      "sunday-breakfast",
      "sunday-lunch",
      "closing-ceremony",
    ]);
  });

  it("otorga premios de podio en los tres concursos", () => {
    const rankedEvents = schedule
      .flatMap((day) => day.events)
      .filter((event) => event.podiumPoints);

    expect(rankedEvents.map((event) => event.id)).toEqual([
      "tapas-lunch",
      "talent-show",
      "domino-championship",
    ]);
    expect(rankedEvents[0].podiumPoints).toEqual({ first: 15, second: 10, third: 5 });
  });
});

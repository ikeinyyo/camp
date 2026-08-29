import { describe, expect, it } from "vitest";
import { filterVouchersByTitle } from "./voucher-search";

const vouchers = [
  { id: "1", title: "Preparar el desayuno" },
  { id: "2", title: "Recoger la mesa" },
  { id: "3", title: "Encargarse de la música" },
];

describe("filterVouchersByTitle", () => {
  it("busca por una parte del título sin distinguir mayúsculas ni tildes", () => {
    expect(filterVouchersByTitle(vouchers, "MUSICA").map((voucher) => voucher.id)).toEqual(["3"]);
    expect(filterVouchersByTitle(vouchers, "  mesa ").map((voucher) => voucher.id)).toEqual(["2"]);
  });

  it("devuelve todo el catálogo cuando la búsqueda está vacía", () => {
    expect(filterVouchersByTitle(vouchers, "   ")).toBe(vouchers);
  });
});

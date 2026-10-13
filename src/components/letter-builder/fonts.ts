import { Archivo_Black, Chewy, Lilita_One } from "next/font/google";

// The fonts the physical pieces are modelled from. Imported only by the letter-builder
// components, so only the pages that render a builder download them.
const lilita = Lilita_One({ weight: "400", subsets: ["latin"], display: "swap" });
const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], display: "swap" });
const chewy = Chewy({ weight: "400", subsets: ["latin"], display: "swap" });

export const BUILDER_FONTS: Record<string, string> = {
  lilita: lilita.style.fontFamily,
  archivo: archivo.style.fontFamily,
  chewy: chewy.style.fontFamily,
};

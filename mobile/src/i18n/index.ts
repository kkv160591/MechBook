import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { bn } from "./locales/bn";
import { mr } from "./locales/mr";
import { te } from "./locales/te";
import { ta } from "./locales/ta";
import { gu } from "./locales/gu";
import { ur } from "./locales/ur";
import { kn } from "./locales/kn";
import { or } from "./locales/or";

export const translations = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
  gu,
  ur,
  kn,
  or,
};

export type LanguageKey = keyof typeof translations;
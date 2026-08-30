import crypto from "crypto";

/** Generate a URL/domain-safe slug from Arabic/Latin text. */
export function slugify(input: string): string {
  const latin = input
    .replace(/[\u064B-\u065F\u0640]/g, "") // strip diacritics/tatweel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  if (latin) return latin;
  return `store-${crypto.randomInt(1000, 9999)}`;
}

export function formatSAR(n: number): string {
  return `${new Intl.NumberFormat("en-US").format(n)} ر.س`;
}

export function discountPct(price: number, compare?: number | null): number {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** generate an original license-style activation code (XXXXX-XXXXX-XXXXX-XXXXX-XXXXX) */
export function generateLicenseKey(prefix?: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const group = () =>
    Array.from({ length: 5 }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join("");
  const key = `${group()}-${group()}-${group()}-${group()}-${group()}`;
  return prefix ? `${prefix}-${key}` : key;
}

export function generateOrderNumber(): string {
  const n = crypto.randomInt(100000, 999999);
  return `MB-${n}`;
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Luhn check for the demo card form */
export function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

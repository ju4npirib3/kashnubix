/**
 * Converts a Spanish spoken phrase into a numeric amount string.
 * e.g. "ciento veinte" → "120", "dos mil quinientos" → "2500"
 * Also handles if the recognizer already returns digits: "120" → "120"
 */

const ONES: Record<string, number> = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
  trece: 13, catorce: 14, quince: 15, dieciséis: 16, dieciseis: 16,
  diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiún: 21, veintiuno: 21, veintidós: 22, veintidos: 22,
  veintitrés: 23, veintitres: 23, veinticuatro: 24, veinticinco: 25,
  veintiséis: 26, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
};

const TENS: Record<string, number> = {
  treinta: 30, cuarenta: 40, cincuenta: 50,
  sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
};

const HUNDREDS: Record<string, number> = {
  cien: 100, ciento: 100,
  doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300,
  cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500,
  seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700,
  ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900,
};

function parseWords(words: string[]): number {
  let total = 0;
  let current = 0;
  let i = 0;

  while (i < words.length) {
    const w = words[i];

    if (w === 'mil' || w === 'miles') {
      total += (current === 0 ? 1 : current) * 1000;
      current = 0;
    } else if (w === 'millón' || w === 'millon' || w === 'millones') {
      total += (current === 0 ? 1 : current) * 1_000_000;
      current = 0;
    } else if (HUNDREDS[w] !== undefined) {
      current += HUNDREDS[w];
    } else if (TENS[w] !== undefined) {
      current += TENS[w];
    } else if (ONES[w] !== undefined) {
      current += ONES[w];
    } else if (w === 'y') {
      // connector word, skip
    }
    i++;
  }

  return total + current;
}

export function parseSpanishAmount(raw: string): string {
  const text = raw.toLowerCase().trim();

  // 1. If transcript already has digits (e.g. "120", "1,500", "1.500"), use them directly
  const digitOnly = text.replace(/[^0-9.,]/g, '');
  if (digitOnly.length > 0) {
    // Normalize: in es-MX "1.500" might mean 1500, "1,50" might mean 1.50
    // If comma looks like decimal separator (e.g. "1,50"), use it as decimal
    const cleaned = digitOnly
      .replace(/\.(?=\d{3}(\D|$))/g, '') // remove thousands dots
      .replace(',', '.');                  // comma → decimal point
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return String(num);
  }

  // 2. Parse Spanish word numbers
  // Handle decimal part: "punto X", "con X", "coma X"
  let intPart = text;
  let decPart = '';

  const decMatch = text.match(/\s+(punto|con|coma)\s+(.+)$/);
  if (decMatch) {
    intPart = text.slice(0, decMatch.index);
    const decWords = decMatch[2].trim().split(/\s+/);
    const decNum = parseWords(decWords);
    // If decNum is a single/double digit, treat as cents (50 → .50, 5 → .05)
    decPart = decNum < 10 ? `.0${decNum}` : `.${decNum}`;
  }

  const intWords = intPart.trim().split(/\s+/).filter(Boolean);
  if (intWords.length === 0) return '';

  const intNum = parseWords(intWords);
  if (intNum === 0 && !intWords.some(w => w === 'cero')) return '';

  const result = `${intNum}${decPart}`;
  return parseFloat(result) > 0 || intWords.includes('cero') ? result : '';
}

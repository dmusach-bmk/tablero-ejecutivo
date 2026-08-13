/**
 * Utility to intelligently parse dates from Spanish text comments and returns YYYY-MM-DD string or null.
 * 
 * Supports:
 * - ISO dates: 2026-08-25, 2026/08/25
 * - European dates: 25/08/2026, 25-08-2026, 25/08
 * - Spanish month names: "25 de agosto", "15 de septiembre", "1 de octubre de 2026"
 * - Relative terms: "hoy", "mañana", "manana", "en 3 días"
 * - Days of the week: "el viernes", "este lunes", "para el próximo martes"
 */
export function extractDateFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase().trim();

  // 1. ISO format YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = lower.match(/\b(202\d)[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2];
    const day = isoMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 2. Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = lower.match(/\b(0[1-9]|[12]\d|3[01])[-/](0[1-9]|1[0-2])[-/](202\d)\b/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 3. Format DD/MM or DD-MM (assumes current year 2026)
  const dmMatch = lower.match(/\b(0[1-9]|[12]\d|3[01])[-/](0[1-9]|1[0-2])\b/);
  if (dmMatch) {
    const day = dmMatch[1].padStart(2, '0');
    const month = dmMatch[2].padStart(2, '0');
    const year = new Date().getFullYear();
    return `${year}-${month}-${day}`;
  }

  // 4. Spanish month names (e.g., "25 de agosto", "15 de septiembre de 2026")
  const monthsMap = {
    enero: '01', ene: '01',
    febrero: '02', feb: '02',
    marzo: '03', mar: '03',
    abril: '04', abr: '04',
    mayo: '05', may: '05',
    junio: '06', jun: '06',
    julio: '07', jul: '07',
    agosto: '08', ago: '08',
    septiembre: '09', setiembre: '09', sep: '09', sept: '09',
    octubre: '10', oct: '10',
    noviembre: '11', nov: '11',
    diciembre: '12', dic: '12'
  };

  const monthKeys = Object.keys(monthsMap).sort((a, b) => b.length - a.length);
  const monthRegexPattern = monthKeys.join('|');
  const textDateRegex = new RegExp(`\\b([0-3]?\\d)\\s+(?:de\\s+)?(${monthRegexPattern})(?:\\s+(?:de\\s+)?(202\\d))?\\b`, 'i');
  const textDateMatch = lower.match(textDateRegex);
  
  if (textDateMatch) {
    const dayNum = parseInt(textDateMatch[1], 10);
    if (dayNum >= 1 && dayNum <= 31) {
      const day = dayNum.toString().padStart(2, '0');
      const monthStr = textDateMatch[2].toLowerCase();
      const month = monthsMap[monthStr];
      const year = textDateMatch[3] || new Date().getFullYear().toString();
      if (month) {
        return `${year}-${month}-${day}`;
      }
    }
  }

  // 5. Relative keywords: "hoy", "mañana", "en N días"
  const today = new Date();
  if (/\b(hoy)\b/.test(lower)) {
    return formatDateISO(today);
  }
  if (/\b(mañana|manana)\b/.test(lower)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return formatDateISO(tomorrow);
  }
  const inDaysMatch = lower.match(/\ben\s+(\d+)\s+d[ií]as\b/);
  if (inDaysMatch) {
    const numDays = parseInt(inDaysMatch[1], 10);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + numDays);
    return formatDateISO(targetDate);
  }

  // 6. Day of week: "el viernes", "para el lunes", "este martes"
  const daysOfWeek = {
    domingo: 0, dom: 0,
    lunes: 1, lun: 1,
    martes: 2, mar: 2,
    miercoles: 3, miér: 3, mier: 3,
    jueves: 4, jue: 4,
    viernes: 5, vie: 5,
    sabado: 6, sábado: 6, sab: 6
  };
  const dowKeys = Object.keys(daysOfWeek).sort((a, b) => b.length - a.length);
  const dowPattern = dowKeys.join('|');
  const dowRegex = new RegExp(`\\b(?:el|este|para el|próximo|proximo)?\\s*(${dowPattern})\\b`, 'i');
  const dowMatch = lower.match(dowRegex);
  if (dowMatch) {
    const targetDow = daysOfWeek[dowMatch[1].toLowerCase()];
    if (targetDow !== undefined) {
      const currentDow = today.getDay();
      let daysToAdd = targetDow - currentDow;
      if (daysToAdd <= 0) daysToAdd += 7;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      return formatDateISO(targetDate);
    }
  }

  return null;
}

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

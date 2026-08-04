/**
 * Maps each problem ID to its allowed language(s).
 * Empty array or missing entry = available for all languages.
 */
export const PROBLEM_LANGUAGES: Record<number, string[]> = {
  // ========== PYTHON ==========
  2: ['Python'],
  4: ['Python'],
  5: ['Python'],
  6: ['Python'],
  8: ['Python'],
  10: ['Python'],
  12: ['Python'],
  17: ['Python'],
  18: ['Python'],
  19: ['Python'],
  22: ['Python'],
  25: ['Python'],
  30: ['Python'],
  32: ['Python'],
  37: ['Python'],
  41: ['Python'],
  42: ['Python'],

  // ========== C++ ==========
  24: ['Cpp'],
  29: ['Cpp'],
  31: ['Cpp'],
  34: ['Cpp'],
  36: ['Cpp'],
  39: ['Cpp'],
  40: ['Cpp'],
  43: ['Cpp'],
  44: ['Cpp'],
  45: ['Cpp'],
  46: ['Cpp'],
  51: ['Cpp'],
  52: ['Cpp'],
  65: ['Cpp'],
  68: ['Cpp'],
  72: ['Cpp'],
  76: ['Cpp'],

  // ========== JAVA ==========
  47: ['Java'],
  48: ['Java'],
  49: ['Java'],
  50: ['Java'],
  54: ['Java'],
  55: ['Java'],
  59: ['Java'],
  60: ['Java'],
  63: ['Java'],
  85: ['Java'],
  87: ['Java'],
  97: ['Java'],
  99: ['Java'],
  115: ['Java'],
  126: ['Java'],
  128: ['Java'],
  132: ['Java'],

  // ========== JAVASCRIPT ==========
  64: ['JavaScript'],
  71: ['JavaScript'],
  73: ['JavaScript'],
  74: ['JavaScript'],
  75: ['JavaScript'],
  77: ['JavaScript'],
  78: ['JavaScript'],
  79: ['JavaScript'],
  80: ['JavaScript'],
  135: ['JavaScript'],
  140: ['JavaScript'],
  145: ['JavaScript'],
  149: ['JavaScript'],
  154: ['JavaScript'],
  158: ['JavaScript'],
  164: ['JavaScript'],
  174: ['JavaScript'],

  // ========== SHARED EASY (all 4 languages) ==========
  13: ['Python', 'Cpp', 'Java', 'JavaScript'],
  14: ['Python', 'Cpp', 'Java', 'JavaScript'],
  20: ['Python', 'Cpp', 'Java', 'JavaScript'],
  28: ['Python', 'Cpp', 'Java', 'JavaScript'],
  35: ['Python', 'Cpp', 'Java', 'JavaScript'],
  38: ['Python', 'Cpp', 'Java', 'JavaScript'],
  58: ['Python', 'Cpp', 'Java', 'JavaScript'],
  66: ['Python', 'Cpp', 'Java', 'JavaScript'],
};

/**
 * Given a language display name, return the internal name used in PROBLEM_LANGUAGES.
 */
export function normalizeLanguage(lang: string): string {
  const map: Record<string, string> = {
    python: 'Python',
    'c++': 'Cpp',
    cpp: 'Cpp',
    java: 'Java',
    javascript: 'JavaScript',
    js: 'JavaScript',
  };
  return map[lang.toLowerCase()] || lang;
}

/**
 * Check if a problem is available for the given language.
 * If the problem has no language restriction, it's available for all.
 */
export function isProblemAvailableForLanguage(problemId: number, language: string | null): boolean {
  if (!language) return true;
  const allowed = PROBLEM_LANGUAGES[problemId];
  if (!allowed || allowed.length === 0) return true;
  const normalized = normalizeLanguage(language);
  return allowed.includes(normalized);
}

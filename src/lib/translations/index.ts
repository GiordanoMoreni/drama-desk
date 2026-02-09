import it from './it.json';

export type Translations = typeof it;

// Type-safe translation key accessor
export function t(key: string, defaultValue?: string): string {
  const keys = key.split('.');
  let value: any = it;

  for (const k of keys) {
    value = value?.[k];
    if (!value) {
      return defaultValue || key;
    }
  }

  return typeof value === 'string' ? value : key;
}

// Get all translations
export function getTranslations() {
  return it;
}

// Get a translation section
export function getSection(section: keyof Translations): (typeof it)[typeof section] {
  return it[section];
}

// Template string interpolation helper
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] || `{${key}}`));
}

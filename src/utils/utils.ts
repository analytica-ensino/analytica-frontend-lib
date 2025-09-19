import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { syncDropdownState } from './dropdown';

/**
 * Retorna a cor hexadecimal com opacidade 0.7 (b3) se não estiver em dark mode.
 * Se estiver em dark mode, retorna a cor original.
 *
 * @param hexColor - Cor hexadecimal (ex: "#0066b8" ou "0066b8")
 * @param isDark - booleano indicando se está em dark mode
 * @returns string - cor hexadecimal com opacidade se necessário
 */
export function getSubjectColorWithOpacity(
  hexColor: string | undefined,
  isDark: boolean
): string | undefined {
  if (!hexColor) return undefined;
  // Remove o '#' se existir
  let color = hexColor.replace(/^#/, '').toLowerCase();

  if (isDark) {
    // Se está em dark mode, sempre remove opacidade se existir
    if (color.length === 8) {
      color = color.slice(0, 6);
    }
    return `#${color}`;
  } else {
    // Se não está em dark mode (light mode)
    let resultColor: string;
    if (color.length === 6) {
      // Adiciona opacidade 0.7 (b3) para cores de 6 dígitos
      resultColor = `#${color}b3`;
    } else if (color.length === 8) {
      // Já tem opacidade, retorna como está
      resultColor = `#${color}`;
    } else {
      // Para outros tamanhos (3, 4, 5 dígitos), retorna como está
      resultColor = `#${color}`;
    }
    return resultColor;
  }
}

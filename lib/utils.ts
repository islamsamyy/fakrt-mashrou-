import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function emitSystemLog(msg: string, type: 'info' | 'warn' | 'success' | 'danger' | 'intel' = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('system-log', {
      detail: { msg, type }
    }));
  }
}

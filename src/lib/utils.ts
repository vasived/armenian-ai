import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique IDs to prevent React key conflicts
let idCounter = 0;

export function generateUniqueId(prefix: string = ''): string {
  idCounter += 1;
  return `${prefix}${Date.now()}-${idCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

// Alternative shorter unique ID for messages
export function generateMessageId(): string {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

// Alternative shorter unique ID for chat sessions
export function generateSessionId(): string {
  idCounter += 1;
  return `session-${Date.now()}-${idCounter}`;
}

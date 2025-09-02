import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import md5 from "md5";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGravatarUrl(email: string | null | undefined): string {
  if (!email) {
    // Default image if email is not available
    return `https://www.gravatar.com/avatar/?d=mp`;
  }
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=mp`;
}

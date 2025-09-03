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

export function getInitials(name: string | null | undefined, email: string | null | undefined = ""): string {
  if (name) {
    const names = name.split(" ");
    if (names.length > 1 && names[0] && names[1]) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "U";
}

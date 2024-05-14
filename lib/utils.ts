import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const removeBracketText = (text: string) => {
  //const regex1 = "\(.*?\)";
  const regex1 = /\[.*?\]/;
  const regex2 = /\(.*?\)/;
  const result = text.replace(regex1, "").replace(regex2, "");

  return result;
};


/**
 * Doctor Components Constants
 * Centralized values for labels, colors, and configuration
 */

export const GENDER_LABELS = {
  M: "Homme",
  F: "Femme",
  O: "Autre",
} as const;

export const PAGINATION = {
  PATIENTS_PER_PAGE: 6,
} as const;

export const CARD_COLORS = {
  avatar: "from-blue-500 to-blue-600",
  border: "border-l-blue-500",
  badge: {
    age: "bg-gray-100 text-gray-600",
    gender: "bg-blue-50 text-blue-600",
  },
} as const;

export const SECTION_ICONS = {
  contact: "text-blue-600",
  medical: "text-red-600",
  emergency: "text-orange-600",
  insurance: "text-green-600",
} as const;

export const ICONS_CONFIG = {
  avatar: {
    size: "w-16 h-16",
    textSize: "text-2xl",
  },
  cardAvatar: {
    size: "w-14 h-14",
    textSize: "text-lg",
  },
} as const;

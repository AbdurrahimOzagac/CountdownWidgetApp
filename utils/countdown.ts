export const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const DAYS_IN_MONTH = 30;

export type NumberParts = {
  intPart: string;
  decimalPart: string;
};

export type CountdownMetrics = {
  hasTargetDate: boolean;
  isPastTarget: boolean;
  daysLeft: number;
  weeksParts: NumberParts | null;
  monthsParts: NumberParts | null;
};

export const formatNumberParts = (value: number): NumberParts => {
  const fixed = value.toFixed(1);
  const [intPart, decimalPart = '0'] = fixed.split('.');
  return {
    intPart,
    decimalPart,
  };
};

export const calculateCountdown = (
  targetDate: Date | null,
  referenceDate: Date = new Date()
): CountdownMetrics => {
  if (!targetDate) {
    return {
      hasTargetDate: false,
      isPastTarget: false,
      daysLeft: 0,
      weeksParts: null,
      monthsParts: null,
    };
  }

  const diffMs = targetDate.getTime() - referenceDate.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / DAY_IN_MS));
  const isPastTarget = diffMs <= 0;

  if (isPastTarget || daysLeft <= 0) {
    return {
      hasTargetDate: true,
      isPastTarget: true,
      daysLeft,
      weeksParts: null,
      monthsParts: null,
    };
  }

  return {
    hasTargetDate: true,
    isPastTarget: false,
    daysLeft,
    weeksParts: formatNumberParts(daysLeft / 7),
    monthsParts: formatNumberParts(daysLeft / DAYS_IN_MONTH),
  };
};

export const formatDateForInput = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const parseDateInput = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/[-/]/g, '.');
  const parts = normalized.split('.').map((part) => part.trim()).filter(Boolean);

  if (parts.length !== 3) {
    return null;
  }

  const [dayStr, monthStr, yearStr] = parts;
  const day = Number.parseInt(dayStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const year = Number.parseInt(yearStr, 10);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }

  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return candidate;
};

import { Anniversary } from '../types';
import { parseLocalDate } from './dateUtils';

export interface CountdownState {
  isBeforeStart: boolean;
  isCompleted: boolean;
  totalDays: number;
  daysPassed: number;
  daysRemaining: number;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
  totalDaysDating: number;
  mealsWaited: number;
  hugsSent: number;
}

export function calculateMilitaryCountdown(
  startDateStr: string,
  endDateStr: string,
  datingDateStr: string,
  now: Date = new Date()
): CountdownState {
  const start = parseLocalDate(startDateStr).getTime();
  const end = parseLocalDate(endDateStr).getTime();
  const dating = parseLocalDate(datingDateStr).getTime();
  const current = now.getTime();

  const totalMs = Math.max(1, end - start);
  const totalDays = Math.round(totalMs / (1000 * 60 * 60 * 24));

  const totalDaysDating = Math.max(0, Math.floor((current - dating) / (1000 * 60 * 60 * 24)));

  const isBeforeStart = current < start;
  const isCompleted = current >= end;

  let daysPassed: number;
  let daysRemaining: number;
  let progressPercent: number;

  if (isBeforeStart) {
    const diffToStart = start - current;
    daysRemaining = Math.max(0, Math.floor(diffToStart / (1000 * 60 * 60 * 24)));
    daysPassed = 0;
    progressPercent = 0;
  } else if (isCompleted) {
    daysPassed = totalDays;
    daysRemaining = 0;
    progressPercent = 100;
  } else {
    const passedMs = current - start;
    const remainingMs = end - current;

    daysPassed = Math.floor(passedMs / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    progressPercent = Math.min(100, Math.max(0, (passedMs / totalMs) * 100));
  }

  // Calculate live hours, minutes, seconds towards discharge (or towards enlistment if before)
  const targetTime = isBeforeStart ? start : end;
  const delta = Math.max(0, targetTime - current);

  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  // Sweet estimated stats
  const mealsWaited = Math.max(1, daysPassed * 3);
  const hugsSent = Math.max(1, daysPassed * 12 + hours * 2);

  return {
    isBeforeStart,
    isCompleted,
    totalDays,
    daysPassed,
    daysRemaining,
    hours,
    minutes,
    seconds,
    progressPercent,
    totalDaysDating,
    mealsWaited,
    hugsSent,
  };
}

export interface AnniversaryStatus {
  anniversary: Anniversary;
  daysRemaining: number;
  isToday: boolean;
  isUrgent: boolean; // within reminderDaysBefore
  formattedDate: string;
}

export function getAnniversaryStatus(anniv: Anniversary, now: Date = new Date()): AnniversaryStatus {
  const currentYear = now.getFullYear();
  let targetYear = currentYear;

  const parts = anniv.date.split('-');
  const month = parseInt(parts[parts.length - 2], 10) - 1;
  const day = parseInt(parts[parts.length - 1], 10);

  if (anniv.isAnnual) {
    let target = new Date(currentYear, month, day);
    // If passed this year, take next year
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (target.getTime() < startOfToday) {
      target = new Date(currentYear + 1, month, day);
      targetYear = currentYear + 1;
    }
    const diff = Math.ceil((target.getTime() - startOfToday) / (1000 * 60 * 60 * 24));
    const isToday = diff === 0;
    const isUrgent = diff >= 0 && diff <= anniv.reminderDaysBefore;

    return {
      anniversary: anniv,
      daysRemaining: diff,
      isToday,
      isUrgent,
      formattedDate: `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${targetYear}`,
    };
  } else {
    // Specific date
    const fullDate = parseLocalDate(anniv.date);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(fullDate.getFullYear(), fullDate.getMonth(), fullDate.getDate()).getTime();
    const diff = Math.ceil((target - startOfToday) / (1000 * 60 * 60 * 24));

    return {
      anniversary: anniv,
      daysRemaining: diff,
      isToday: diff === 0,
      isUrgent: diff >= 0 && diff <= anniv.reminderDaysBefore,
      formattedDate: `${fullDate.getDate().toString().padStart(2, '0')}/${(fullDate.getMonth() + 1).toString().padStart(2, '0')}/${fullDate.getFullYear()}`,
    };
  }
}

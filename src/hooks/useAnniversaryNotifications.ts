import { useEffect, useRef } from 'react';
import { Anniversary } from '../types';
import { getAnniversaryStatus } from '../utils/dateCalculations';
import { sendNotification } from '../utils/notifications';

const NOTIFIED_KEY = 'love_soldier_notified_anniversaries';

// Sends one browser notification per anniversary that is "today" or within its
// reminder window. Uses a localStorage ledger (date -> anniv id) so each
// anniversary is notified at most once per day.
export function useAnniversaryNotifications(
  anniversaries: Anniversary[],
  enabled: boolean
): void {
  const ledgerRef = useRef<Record<string, string[]>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIFIED_KEY);
      if (raw) ledgerRef.current = JSON.parse(raw);
    } catch {
      ledgerRef.current = {};
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const alreadyToday = ledgerRef.current[today] ?? [];

    for (const anniv of anniversaries) {
      if (alreadyToday.includes(anniv.id)) continue;
      const status = getAnniversaryStatus(anniv, now);
      if (!status.isToday && !status.isUrgent) continue;

      const title = status.isToday
        ? `💖 ${anniv.title} — Hôm nay!`
        : `🔔 Sắp đến: ${anniv.title}`;
      const body = status.isToday
        ? 'Kỷ niệm đáng nhớ của hai đứa mình là hôm nay!'
        : `Còn ${status.daysRemaining} ngày nữa. Đừng quên nhé!`;

      sendNotification(title, body);
      alreadyToday.push(anniv.id);
    }

    const nextLedger = { ...ledgerRef.current, [today]: alreadyToday };
    ledgerRef.current = nextLedger;
    try {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(nextLedger));
    } catch {
      // ignore
    }
  }, [anniversaries, enabled]);
}

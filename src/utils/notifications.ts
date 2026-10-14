export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function sendNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/icon.svg' });
  } catch {
    // ignore failures (e.g. some browsers require a service worker)
  }
}

type BadgeNav = Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };

/** Hiển thị số ngày còn lại lên badge icon app (PWA). Không hỗ trợ thì bỏ qua. */
export async function setCountdownBadge(daysRemaining: number): Promise<void> {
  const nav = navigator as BadgeNav;
  if (!nav.setAppBadge) return;
  try {
    await nav.setAppBadge(Math.max(1, daysRemaining));
  } catch {
    // ignore
  }
}

export async function clearAppBadge(): Promise<void> {
  const nav = navigator as BadgeNav;
  if (!nav.clearAppBadge) return;
  try {
    await nav.clearAppBadge();
  } catch {
    // ignore
  }
}

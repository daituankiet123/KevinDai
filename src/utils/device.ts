/** Phát hiện thiết bị iOS / chạy trong webview Capacitor để bật giao diện kiểu iPhone. */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
}

export function isCapacitor(): boolean {
  return typeof (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor !==
    'undefined';
}

/** Ép test giao diện iOS trên máy khác bằng cách thêm ?ios=1 vào URL. */
export function isIOSPreview(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('ios') === '1';
}

export function isNativeIOSApp(): boolean {
  return isCapacitor() || isIOS() || isIOSPreview();
}

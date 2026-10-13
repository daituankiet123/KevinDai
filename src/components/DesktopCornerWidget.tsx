import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Pin,
  ExternalLink,
  Minimize2,
  Maximize2,
  X,
  Compass,
  Monitor,
  Sparkles,
  Shield,
  Smile,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleData } from '../types';
import { CountdownState } from '../utils/dateCalculations';
import { playHeartPop, playSweetChime } from '../utils/audio';

interface DesktopCornerWidgetProps {
  couple: CoupleData;
  countdown: CountdownState;
  isVisible: boolean;
  onToggleVisible: () => void;
  soundEnabled: boolean;
}

type CornerPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export const DesktopCornerWidget: React.FC<DesktopCornerWidgetProps> = ({
  couple,
  countdown,
  isVisible,
  onToggleVisible,
  soundEnabled,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    return localStorage.getItem('corner_widget_expanded') !== 'false';
  });
  const [position, setPosition] = useState<CornerPosition>(() => {
    return (localStorage.getItem('corner_widget_pos') as CornerPosition) || 'bottom-right';
  });
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [justHearted, setJustHearted] = useState<boolean>(false);

  // Hidden canvas and video element for standard video PiP fallback
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Save state
  useEffect(() => {
    localStorage.setItem('corner_widget_expanded', String(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('corner_widget_pos', position);
  }, [position]);

  const cyclePosition = () => {
    playHeartPop(soundEnabled);
    const positions: CornerPosition[] = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
    const nextIdx = (positions.indexOf(position) + 1) % positions.length;
    setPosition(positions[nextIdx]);
  };

  const handleHeart = (e: React.MouseEvent) => {
    playHeartPop(soundEnabled);
    setJustHearted(true);
    setTimeout(() => setJustHearted(false), 600);

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 15,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#f43f5e', '#fb7185', '#ec4899', '#fda4af'],
    });
  };

  // Picture-in-Picture for native OS floating overlay
  const handleLaunchDesktopPip = async () => {
    playSweetChime(soundEnabled);

    // 1. Try Document Picture-in-Picture API (Chrome 116+, Edge)
    const anyWindow = window as unknown as {
      documentPictureInPicture?: {
        requestWindow: (options: { width: number; height: number }) => Promise<Window>;
      };
    };

    if (anyWindow.documentPictureInPicture) {
      try {
        const pipWindow = await anyWindow.documentPictureInPicture.requestWindow({
          width: 360,
          height: 200,
        });

        // Copy styles
        Array.from(document.styleSheets).forEach((styleSheet) => {
          try {
            if (styleSheet.cssRules) {
              const newStyleEl = pipWindow.document.createElement('style');
              Array.from(styleSheet.cssRules).forEach((rule) => {
                newStyleEl.appendChild(pipWindow.document.createTextNode(rule.cssText));
              });
              pipWindow.document.head.appendChild(newStyleEl);
            }
          } catch {
            if (styleSheet.href) {
              const newLinkEl = pipWindow.document.createElement('link');
              newLinkEl.rel = 'stylesheet';
              newLinkEl.href = styleSheet.href;
              pipWindow.document.head.appendChild(newLinkEl);
            }
          }
        });

        // Add tailwind or inline styles
        const baseStyle = pipWindow.document.createElement('style');
        baseStyle.textContent = `
          body {
            margin: 0;
            padding: 12px;
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #fff1f2, #ffe4e6, #fce7f3);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
            user-select: none;
          }
          .card {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #fecdd3;
            border-radius: 20px;
            padding: 14px 16px;
            box-shadow: 0 10px 25px rgba(244, 63, 94, 0.15);
            width: 100%;
            text-align: center;
          }
          .title {
            font-size: 13px;
            font-weight: 800;
            color: #e11d48;
            margin-bottom: 2px;
          }
          .subtitle {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 10px;
          }
          .timer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-bottom: 10px;
          }
          .timer-box {
            background: #fff;
            border: 1px solid #fecdd3;
            padding: 4px 6px;
            border-radius: 8px;
            min-width: 44px;
          }
          .num {
            font-size: 15px;
            font-weight: 900;
            color: #e11d48;
          }
          .label {
            font-size: 8px;
            color: #94a3b8;
            text-transform: uppercase;
          }
          .bar {
            height: 6px;
            background: #f1f5f9;
            border-radius: 99px;
            overflow: hidden;
            margin-bottom: 6px;
          }
          .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #f43f5e);
            width: ${Math.min(100, Math.max(2, countdown.progressPercent))}%;
          }
          .footer {
            font-size: 10px;
            color: #059669;
            font-weight: 700;
          }
        `;
        pipWindow.document.head.appendChild(baseStyle);

        // Render card into pip window
        const container = pipWindow.document.createElement('div');
        container.className = 'card';
        container.innerHTML = `
          <div class="title">💖 ${couple.boyfriendNickname || 'Ông Chã Húi'} &amp; ${couple.girlfriendNickname || 'Bà Chã Thơm'}</div>
          <div class="subtitle">Đếm ngược xuất ngũ: 10/01/2028 · Y tá Đại đội</div>
          <div class="timer">
            <div class="timer-box"><div class="num" id="d">${countdown.daysRemaining}</div><div class="label">Ngày</div></div>
            <div class="timer-box"><div class="num" id="h">${countdown.hours}</div><div class="label">Giờ</div></div>
            <div class="timer-box"><div class="num" id="m">${countdown.minutes}</div><div class="label">Phút</div></div>
            <div class="timer-box"><div class="num" id="s">${countdown.seconds}</div><div class="label">Giây</div></div>
          </div>
          <div class="bar"><div class="bar-fill"></div></div>
          <div class="footer">Tiến độ quân ngũ: ${countdown.progressPercent.toFixed(1)}% (${countdown.daysPassed}/${countdown.totalDays} ngày)</div>
        `;
        pipWindow.document.body.appendChild(container);

        // Update live tick inside PiP
        const pipInterval = setInterval(() => {
          const dEl = pipWindow.document.getElementById('d');
          const hEl = pipWindow.document.getElementById('h');
          const mEl = pipWindow.document.getElementById('m');
          const sEl = pipWindow.document.getElementById('s');
          if (dEl) dEl.textContent = String(countdown.daysRemaining);
          if (hEl) hEl.textContent = String(countdown.hours).padStart(2, '0');
          if (mEl) mEl.textContent = String(countdown.minutes).padStart(2, '0');
          if (sEl) sEl.textContent = String(countdown.seconds).padStart(2, '0');
        }, 1000);

        pipWindow.addEventListener('pagehide', () => {
          clearInterval(pipInterval);
          setIsPipActive(false);
        });

        setIsPipActive(true);
        return;
      } catch (err) {
        console.warn('Document PiP failed, trying canvas video PiP:', err);
      }
    }

    // 2. Fallback: Canvas Stream to Video PiP (supported in all browsers)
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw card on canvas
    const drawCanvas = () => {
      canvas.width = 400;
      canvas.height = 220;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 400, 220);
      grad.addColorStop(0, '#fff1f2');
      grad.addColorStop(1, '#ffe4e6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 220);

      // Card box
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(244, 63, 94, 0.2)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.roundRect(15, 15, 370, 190, 16);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Text Header
      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(
        `💖 ${couple.boyfriendNickname || 'Ông Chã Húi'} & ${couple.girlfriendNickname || 'Bà Chã Thơm'}`,
        200,
        45
      );

      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui';
      ctx.fillText('Đếm ngược xuất ngũ: 10/01/2028 · Y tá Đại đội', 200, 68);

      // Countdown Boxes
      const units = [
        { val: countdown.daysRemaining, label: 'NGÀY' },
        { val: String(countdown.hours).padStart(2, '0'), label: 'GIỜ' },
        { val: String(countdown.minutes).padStart(2, '0'), label: 'PHÚT' },
        { val: String(countdown.seconds).padStart(2, '0'), label: 'GIÂY' },
      ];

      units.forEach((u, i) => {
        const x = 50 + i * 80;
        ctx.fillStyle = '#fff1f2';
        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, 85, 62, 55, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 20px system-ui';
        ctx.fillText(String(u.val), x + 31, 115);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px system-ui';
        ctx.fillText(u.label, x + 31, 132);
      });

      // Progress bar
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(40, 155, 320, 8, 4);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(40, 155, 320 * (countdown.progressPercent / 100), 8, 4);
      ctx.fill();

      // Progress text
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText(
        `Tiến độ quân ngũ: ${countdown.progressPercent.toFixed(1)}% (${countdown.daysPassed}/${countdown.totalDays} ngày)`,
        200,
        185
      );
    };

    drawCanvas();

    try {
      const stream = canvas.captureStream(2);
      video.srcObject = stream;
      await video.play();
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        await video.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (e) {
      console.error('Video PiP failed:', e);
      alert('Trình duyệt của bạn có thể chưa cấp quyền Picture-in-Picture. Bạn vẫn có thể dùng widget góc màn hình bên dưới nhé!');
    }
  };

  if (!isVisible) return null;

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5',
    'top-right': 'top-20 right-5',
    'top-left': 'top-20 left-5',
  }[position];

  return (
    <>
      {/* Hidden elements for Canvas Video PiP fallback */}
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" muted playsInline />

      <div
        className={`fixed z-40 transition-all duration-300 select-none ${positionClasses}`}
      >
        {!isExpanded ? (
          /* Mini Floating Pill Mode */
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border-2 border-rose-300 shadow-xl hover:shadow-2xl transition group animate-in fade-in zoom-in-90 duration-200">
            {/* Avatars */}
            <div className="flex items-center -space-x-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs overflow-hidden">
                {couple.boyfriendAvatar && (couple.boyfriendAvatar.startsWith('data:') || couple.boyfriendAvatar.startsWith('http')) ? (
                  <img src={couple.boyfriendAvatar} alt="Boyfriend" className="w-full h-full object-cover" />
                ) : (
                  couple.boyfriendAvatar || '👨‍✈️'
                )}
              </span>
              <span className="w-6 h-6 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-xs overflow-hidden">
                {couple.girlfriendAvatar && (couple.girlfriendAvatar.startsWith('data:') || couple.girlfriendAvatar.startsWith('http')) ? (
                  <img src={couple.girlfriendAvatar} alt="Girlfriend" className="w-full h-full object-cover" />
                ) : (
                  couple.girlfriendAvatar || '👧🌸'
                )}
              </span>
            </div>

            {/* Countdown Days */}
            <div
              onClick={() => setIsExpanded(true)}
              className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-700"
            >
              <span className="text-rose-600 font-extrabold tabular-nums">
                {countdown.daysRemaining}
              </span>
              <span className="text-[11px] text-slate-500">ngày nữa đón anh</span>
            </div>

            {/* Quick Heart Pop */}
            <button
              onClick={handleHeart}
              title="Thả tim yêu thương"
              className="p-1 hover:bg-rose-50 rounded-full text-rose-500 transition active:scale-95"
            >
              <Heart
                className={`w-3.5 h-3.5 fill-rose-500 ${
                  justHearted ? 'animate-ping' : 'hover:scale-110'
                }`}
              />
            </button>

            {/* Expand button */}
            <button
              onClick={() => setIsExpanded(true)}
              title="Mở rộng widget"
              className="p-1 hover:bg-rose-50 rounded-full text-slate-400 hover:text-slate-600 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onToggleVisible}
              title="Ẩn widget góc màn hình"
              className="p-1 hover:bg-rose-50 rounded-full text-slate-300 hover:text-slate-500 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          /* Expanded Floating Card Mode */
          <div className="w-72 sm:w-80 bg-gradient-to-b from-white via-rose-50/60 to-white/95 backdrop-blur-md rounded-3xl p-4 border-2 border-rose-300/80 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-100 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-600">
                <Pin className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span className="text-[11px] uppercase tracking-wide">Góc Màn Hình Yêu Thương</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                {/* Launch PiP Desktop overlay */}
                <button
                  onClick={handleLaunchDesktopPip}
                  title="Ghim nổi lên màn hình Desktop (Picture-in-Picture khi thu nhỏ ứng dụng)"
                  className="p-1 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>

                {/* Change Corner */}
                <button
                  onClick={cyclePosition}
                  title="Đổi vị trí góc màn hình"
                  className="p-1 hover:text-slate-700 hover:bg-rose-100 rounded-lg transition"
                >
                  <Compass className="w-3.5 h-3.5" />
                </button>

                {/* Minimize to pill */}
                <button
                  onClick={() => setIsExpanded(false)}
                  title="Thu nhỏ thành thanh icon"
                  className="p-1 hover:text-slate-700 hover:bg-rose-100 rounded-lg transition"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                {/* Hide widget */}
                <button
                  onClick={onToggleVisible}
                  title="Ẩn widget"
                  className="p-1 hover:text-slate-700 hover:bg-rose-100 rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Couple names & avatars */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-sm overflow-hidden shrink-0">
                  {couple.boyfriendAvatar && (couple.boyfriendAvatar.startsWith('data:') || couple.boyfriendAvatar.startsWith('http')) ? (
                    <img src={couple.boyfriendAvatar} alt="Boyfriend" className="w-full h-full object-cover" />
                  ) : (
                    couple.boyfriendAvatar || '👨‍✈️'
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">
                    {couple.boyfriendNickname || 'Ông Chã Húi'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {couple.boyfriendName}
                  </div>
                </div>
              </div>

              <div
                onClick={handleHeart}
                className="cursor-pointer p-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-500 transition active:scale-90"
              >
                <Heart className={`w-4 h-4 fill-rose-500 ${justHearted ? 'animate-ping' : ''}`} />
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="text-[10px] font-bold text-rose-600 uppercase">
                    {couple.girlfriendNickname || 'Bà Chã Thơm'}
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {couple.girlfriendName}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center text-sm overflow-hidden shrink-0">
                  {couple.girlfriendAvatar && (couple.girlfriendAvatar.startsWith('data:') || couple.girlfriendAvatar.startsWith('http')) ? (
                    <img src={couple.girlfriendAvatar} alt="Girlfriend" className="w-full h-full object-cover" />
                  ) : (
                    couple.girlfriendAvatar || '👧🌸'
                  )}
                </div>
              </div>
            </div>

            {/* Countdown Digit Blocks */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              <div className="bg-white rounded-xl p-1.5 text-center border border-rose-200/70 shadow-2xs">
                <div className="text-base font-black text-rose-600 tabular-nums">
                  {countdown.daysRemaining}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Ngày</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 text-center border border-rose-200/70 shadow-2xs">
                <div className="text-base font-black text-rose-600 tabular-nums">
                  {String(countdown.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Giờ</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 text-center border border-rose-200/70 shadow-2xs">
                <div className="text-base font-black text-rose-600 tabular-nums">
                  {String(countdown.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Phút</div>
              </div>
              <div className="bg-white rounded-xl p-1.5 text-center border border-rose-200/70 shadow-2xs">
                <div className="text-base font-black text-rose-600 tabular-nums">
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Giây</div>
              </div>
            </div>

            {/* Progress Bar & Unit note */}
            <div className="space-y-1 bg-white/80 rounded-xl p-2 border border-rose-100">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-600">Tiến độ xuất ngũ 10/01/2028:</span>
                <span className="text-rose-600">{countdown.progressPercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(3, countdown.progressPercent))}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 truncate">
                Đơn vị: {couple.militaryUnit || 'Trường CĐ Hậu cần 2, Thủ Đức'}
              </div>
            </div>

            {/* PiP Action Promo Button */}
            <button
              onClick={handleLaunchDesktopPip}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-[11px] shadow-xs transition"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Ghim Nổi Màn Hình Desktop (PiP)</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

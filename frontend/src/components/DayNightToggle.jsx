// src/components/DayNightToggle.jsx — Full Day/Night morphing toggle per APP_FLOW.md §3b

import { useId } from 'react';

/*
 * Stadium-pill toggle (120×52px) with dual-zone backdrop (Day left / Night right),
 * a 40×40 slider orb that morphs Sun↔Moon via SVG masking, plus parallax clouds,
 * stars, and city skyline with illuminated windows.
 *
 * Props:
 *   isDark   — boolean (false = Day, true = Night)
 *   onToggle — () => void
 */
export default function DayNightToggle({ isDark, onToggle }) {
  const uid = useId().replace(/:/g, '');

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
      className="relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
      style={{ width: 120, height: 52 }}
    >
      {/* ── Dual-tone border pill ── */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden transition-shadow duration-300"
        style={{
          background: `conic-gradient(from 90deg, #F5E6A3 0deg, #F5E6A3 180deg, #00D4FF 180deg, #00D4FF 360deg)`,
          padding: 2,
        }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden">
          {/* ── Day zone (left half) ── */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #FDDCB5, #87CEEB)' }}
          >
            {/* Clouds */}
            <div
              className="absolute"
              style={{
                left: 8,
                top: 8,
                width: 22,
                height: 10,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                opacity: isDark ? 0 : 1,
                transform: isDark ? 'translateX(-8px)' : 'translateX(0)',
                transition: isDark
                  ? 'opacity 0.3s ease-out, transform 0.3s ease-out'
                  : 'opacity 0.4s ease-in 0.1s, transform 0.4s ease-in 0.1s',
              }}
            />
            <div
              className="absolute"
              style={{
                left: 20,
                top: 14,
                width: 16,
                height: 8,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                opacity: isDark ? 0 : 1,
                transform: isDark ? 'translateX(-8px)' : 'translateX(0)',
                transition: isDark
                  ? 'opacity 0.3s ease-out 0.05s, transform 0.3s ease-out 0.05s'
                  : 'opacity 0.4s ease-in 0.15s, transform 0.4s ease-in 0.15s',
              }}
            />

            {/* Day city skyline */}
            <div className="absolute bottom-0 left-0" style={{ width: 60, height: 20 }}>
              <div className="absolute bottom-0 left-[4px]" style={{ width: 6, height: 14, background: '#B8D4E8', borderRadius: '1px 1px 0 0' }} />
              <div className="absolute bottom-0 left-[12px]" style={{ width: 8, height: 18, background: '#A8C8DE', borderRadius: '1px 1px 0 0' }} />
              <div className="absolute bottom-0 left-[22px]" style={{ width: 5, height: 10, background: '#B8D4E8', borderRadius: '1px 1px 0 0' }} />
              <div className="absolute bottom-0 left-[29px]" style={{ width: 7, height: 15, background: '#A8C8DE', borderRadius: '1px 1px 0 0' }} />
              <div className="absolute bottom-0 left-[38px]" style={{ width: 10, height: 8, background: '#B8D4E8', borderRadius: '1px 1px 0 0' }} />
              {/* Bridge silhouette */}
              <div className="absolute bottom-0 left-[6px]" style={{ width: 40, height: 3, background: '#9BBCD0', borderRadius: '2px 2px 0 0' }} />
            </div>
          </div>

          {/* ── Night zone (right half) ── */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #0D1B3E, #1A2F5A)',
              clipPath: 'inset(0 0 0 50%)',
            }}
          >
            {/* Stars */}
            {[
              { x: 68, y: 8, s: 3, d: 0 },
              { x: 80, y: 14, s: 2, d: 0.3 },
              { x: 95, y: 6, s: 4, d: 0.6 },
              { x: 75, y: 22, s: 2.5, d: 0.9 },
              { x: 105, y: 18, s: 3, d: 1.2 },
              { x: 88, y: 10, s: 2, d: 1.5 },
              { x: 100, y: 26, s: 3.5, d: 0.4 },
              { x: 72, y: 30, s: 2, d: 0.8 },
            ].map((star, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: star.x,
                  top: star.y,
                  width: star.s,
                  height: star.s,
                  background: '#FFF',
                  borderRadius: '50%',
                  opacity: isDark ? 1 : 0,
                  transition: isDark
                    ? `opacity 0.4s ease-in ${0.15 + star.d * 0.05}s`
                    : 'opacity 0.25s ease-out',
                  animation: isDark ? `toggle-twinkle 1.5s infinite alternate ${star.d}s` : 'none',
                }}
              />
            ))}

            {/* Night city skyline */}
            <div className="absolute bottom-0 right-0" style={{ width: 60, height: 20 }}>
              <div className="absolute bottom-0 right-[4px]" style={{ width: 6, height: 14, background: '#0F2545', borderRadius: '1px 1px 0 0' }}>
                <div
                  className="absolute"
                  style={{
                    left: 1.5,
                    top: 3,
                    width: 2,
                    height: 2,
                    borderRadius: 1,
                    background: isDark ? '#FFD700' : '#1A2F5A',
                    boxShadow: isDark ? '0 0 4px #FFD700' : 'none',
                    transition: isDark ? 'background 0.4s ease 0.2s, box-shadow 0.4s ease 0.2s' : 'background 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: 1.5,
                    top: 8,
                    width: 2,
                    height: 2,
                    borderRadius: 1,
                    background: isDark ? '#FFD700' : '#1A2F5A',
                    boxShadow: isDark ? '0 0 4px #FFD700' : 'none',
                    transition: isDark ? 'background 0.4s ease 0.25s, box-shadow 0.4s ease 0.25s' : 'background 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-[12px]" style={{ width: 8, height: 18, background: '#0F2545', borderRadius: '1px 1px 0 0' }}>
                <div
                  className="absolute"
                  style={{
                    left: 2,
                    top: 3,
                    width: 2.5,
                    height: 2.5,
                    borderRadius: 1,
                    background: isDark ? '#FFD700' : '#1A2F5A',
                    boxShadow: isDark ? '0 0 6px 2px rgba(255,215,0,0.5)' : 'none',
                    transition: isDark ? 'background 0.4s ease 0.2s, box-shadow 0.4s ease 0.2s' : 'background 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: 2,
                    top: 9,
                    width: 2.5,
                    height: 2.5,
                    borderRadius: 1,
                    background: isDark ? '#FFD700' : '#1A2F5A',
                    boxShadow: isDark ? '0 0 6px 2px rgba(255,215,0,0.5)' : 'none',
                    transition: isDark ? 'background 0.4s ease 0.3s, box-shadow 0.4s ease 0.3s' : 'background 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-[22px]" style={{ width: 5, height: 10, background: '#0F2545', borderRadius: '1px 1px 0 0' }}>
                <div
                  className="absolute"
                  style={{
                    left: 1,
                    top: 2,
                    width: 2,
                    height: 2,
                    borderRadius: 1,
                    background: isDark ? '#FFD700' : '#1A2F5A',
                    boxShadow: isDark ? '0 0 4px #FFD700' : 'none',
                    transition: isDark ? 'background 0.4s ease 0.22s, box-shadow 0.4s ease 0.22s' : 'background 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-[29px]" style={{ width: 7, height: 15, background: '#0F2545', borderRadius: '1px 1px 0 0' }}>
                <div
                  className="absolute"
                  style={{
                    left: 2,
                    top: 4,
                    width: 2,
                    height: 2,
                    borderRadius: 1,
                    background: isDark ? '#FFD700' : '#1A2F5A',
                    boxShadow: isDark ? '0 0 6px 2px rgba(255,215,0,0.5)' : 'none',
                    transition: isDark ? 'background 0.4s ease 0.2s, box-shadow 0.4s ease 0.2s' : 'background 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
              </div>
              <div className="absolute bottom-0 right-[38px]" style={{ width: 10, height: 8, background: '#0F2545', borderRadius: '1px 1px 0 0' }} />
            </div>
          </div>

          {/* ── Slider Orb ── */}
          <div
            className="absolute z-10"
            style={{
              top: 4,
              left: isDark ? 76 : 4,
              width: 40,
              height: 40,
              borderRadius: '50%',
              transition: 'left 0.6s cubic-bezier(0.4,0,0.2,1), box-shadow 0.6s ease',
              boxShadow: isDark
                ? '0 4px 12px rgba(0,212,255,0.5)'
                : '0 4px 12px rgba(249,215,28,0.6)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 100 100">
              <defs>
                <mask id={`moon-mask-${uid}`}>
                  <circle cx="50" cy="50" r="46" fill="white" />
                  <circle
                    r="42"
                    fill="black"
                    style={{
                      cx: isDark ? 62 : 150,
                      cy: isDark ? 28 : -20,
                      transition: 'cx 0.6s cubic-bezier(0.4,0,0.2,1), cy 0.6s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  />
                </mask>
                <radialGradient id={`crater1-${uid}`} cx="35%" cy="40%" r="12%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id={`crater2-${uid}`} cx="65%" cy="65%" r="8%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.10)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Main orb body */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill={isDark ? '#D8D8D8' : '#F9D71C'}
                mask={`url(#moon-mask-${uid})`}
                style={{ transition: 'fill 0.5s ease' }}
              />

              {/* Moon craters — visible only in Night state */}
              <circle
                cx="35"
                cy="40"
                r="10"
                fill={`url(#crater1-${uid})`}
                opacity={isDark ? 1 : 0}
                style={{ transition: 'opacity 0.4s ease 0.2s' }}
              />
              <circle
                cx="65"
                cy="65"
                r="7"
                fill={`url(#crater2-${uid})`}
                opacity={isDark ? 1 : 0}
                style={{ transition: 'opacity 0.4s ease 0.2s' }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Twinkle keyframe injected once */}
      <style>{`
        @keyframes toggle-twinkle {
          from { opacity: 0.5; transform: scale(0.85); }
          to   { opacity: 1.0; transform: scale(1.1); }
        }
      `}</style>
    </button>
  );
}

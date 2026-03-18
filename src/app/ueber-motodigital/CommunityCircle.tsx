'use client'

import { useEffect, useRef } from 'react'

const LOGO_PATH =
  'M1417,167L298.8,627.4L430.3,1943l657.8,723.6v-592l328.9,197.3l328.9-197.3v592l657.8-723.6l131.6-1315.6L1417,167z M2191.2,1611.1l-773.9,451.4v0v0l0,0v0l-773.9-451.4V834.4L1185.2,615v537.7l232.2,135.4l232.2-135.4V615l541.7,219.4V1611.1z'

const CX = 320; const CY = 245
const W = { x: 90,  y: 75  }
const K = { x: 550, y: 75  }
const R = { x: 320, y: 435 }

export default function CommunityCircle() {
  const s1 = useRef<SVGLineElement>(null)
  const s2 = useRef<SVGLineElement>(null)
  const s3 = useRef<SVGLineElement>(null)
  const n1 = useRef<SVGLineElement>(null)
  const n2 = useRef<SVGLineElement>(null)
  const n3 = useRef<SVGLineElement>(null)

  useEffect(() => {
    let raf: number
    let t = 0
    function tick() {
      t += 0.35
      ;[s1, s2, s3].forEach(r => {
        if (r.current) r.current.style.strokeDashoffset = String(-(t % 22))
      })
      ;[n1, n2, n3].forEach(r => {
        if (r.current) r.current.style.strokeDashoffset = String(t % 18)
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="bg-[#111111] py-24 overflow-hidden">
      <style>{`
        @keyframes md-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(1.9); opacity: 0; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes md-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes md-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6,165,165,0.5), 0 0 32px rgba(6,165,165,0.3); }
          50%       { box-shadow: 0 0 0 12px rgba(6,165,165,0), 0 0 48px rgba(6,165,165,0.5); }
        }
        .md-ring { position:absolute; inset:0; border-radius:50%; border:1.5px solid rgba(6,165,165,0.4); animation: md-pulse-ring 2.4s ease-out infinite; }
        .md-ring-2 { animation-delay: 1.2s; }
        .md-logo { animation: md-glow 3s ease-in-out infinite; }
        .md-node { opacity:0; animation: md-fade-up 0.7s ease forwards; }
        .md-n0 { animation-delay: 0.1s; }
        .md-n1 { animation-delay: 0.25s; }
        .md-n2 { animation-delay: 0.4s; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8">

        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#06a5a5] mb-4">Ökosystem</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Drei Welten.<br />Eine Plattform.
          </h2>
          <p className="text-sm text-white/30 mt-4 max-w-sm mx-auto leading-relaxed">
            MotoDigital verbindet alle Teile der Custom Motorcycle Culture — direkt, offen und ohne Umwege.
          </p>
        </div>

        {/* ── Mobile layout — triangle adapted for portrait ── */}
        {/* ViewBox 320×420. Logo center: (160,32). W:(64,168). K:(256,168). R:(160,360) */}
        <div className="lg:hidden relative mx-auto" style={{ width: '100%', maxWidth: 320, height: 420 }}>

          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 420" fill="none">
            {/* Outer triangle — node to node */}
            <line stroke="#06a5a5" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.3" x1="64" y1="168" x2="256" y2="168" />
            <line stroke="#06a5a5" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.3" x1="64" y1="168" x2="160" y2="360" />
            <line stroke="#06a5a5" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.3" x1="256" y1="168" x2="160" y2="360" />
            {/* Spokes from logo */}
            <line ref={s1} stroke="#06a5a5" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.6" x1="160" y1="32" x2="64" y2="168" />
            <line ref={s2} stroke="#06a5a5" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.6" x1="160" y1="32" x2="256" y2="168" />
            <line ref={s3} stroke="#06a5a5" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.6" x1="160" y1="32" x2="160" y2="360" />
            {/* Midpoint markers */}
            <circle cx="160" cy="168" r="2.5" fill="#06a5a5" fillOpacity="0.35" />
            <circle cx="112" cy="264" r="2.5" fill="#06a5a5" fillOpacity="0.35" />
            <circle cx="208" cy="264" r="2.5" fill="#06a5a5" fillOpacity="0.35" />
            {/* Endpoint dots */}
            <circle cx="64"  cy="168" r="3.5" fill="#06a5a5" fillOpacity="0.5" />
            <circle cx="256" cy="168" r="3.5" fill="#06a5a5" fillOpacity="0.5" />
            <circle cx="160" cy="360" r="3.5" fill="#06a5a5" fillOpacity="0.5" />
          </svg>

          {/* Logo — top center */}
          <div className="absolute" style={{ left: '50%', top: 4, transform: 'translateX(-50%)' }}>
            <div className="relative w-14 h-14">
              <div className="md-ring" />
              <div className="md-ring md-ring-2" />
              <div className="md-logo relative w-14 h-14 rounded-full bg-[#06a5a5] flex items-center justify-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2834.6 2834.6" width="24" height="24">
                  <path fill="white" d={LOGO_PATH} />
                </svg>
              </div>
            </div>
          </div>

          {/* Werkstatt — left */}
          <div className="md-node md-n0 absolute flex flex-col items-center gap-2" style={{ left: 0, top: 120 }}>
            <div className="w-32 h-24 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden p-2">
              <img src="/custom-werkstatt.png" alt="Werkstatt" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#06a5a5]">01</p>
              <p className="text-[11px] font-bold text-white/70 mt-0.5">Werkstatt</p>
            </div>
          </div>

          {/* Bike Käufer — right */}
          <div className="md-node md-n1 absolute flex flex-col items-center gap-2" style={{ right: 0, top: 120 }}>
            <div className="w-32 h-24 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden p-2">
              <img src="/custom-bikes.png" alt="Bike Käufer" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#06a5a5]">02</p>
              <p className="text-[11px] font-bold text-white/70 mt-0.5">Bike Käufer</p>
            </div>
          </div>

          {/* Rider — bottom center */}
          <div className="md-node md-n2 absolute flex flex-col items-center gap-2" style={{ left: 'calc(50% - 64px)', top: 312 }}>
            <div className="w-32 h-24 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden p-2">
              <img src="/rider.png" alt="Rider" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#06a5a5]">03</p>
              <p className="text-[11px] font-bold text-white/70 mt-0.5">Rider</p>
            </div>
          </div>

        </div>

        {/* ── Desktop triangle ── */}
        <div className="hidden lg:block relative mx-auto" style={{ width: '100%', maxWidth: 640, height: 560 }}>

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 520" fill="none">
            {/* Outer triangle — node to node, animated */}
            <line ref={n1} x1={W.x} y1={W.y} x2={K.x} y2={K.y}
              stroke="#06a5a5" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.3" />
            <line ref={n2} x1={W.x} y1={W.y} x2={R.x} y2={R.y}
              stroke="#06a5a5" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.3" />
            <line ref={n3} x1={K.x} y1={K.y} x2={R.x} y2={R.y}
              stroke="#06a5a5" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.3" />

            {/* Center spokes — animated outward */}
            <line ref={s1} x1={CX} y1={CY} x2={W.x} y2={W.y}
              stroke="#06a5a5" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.6" />
            <line ref={s2} x1={CX} y1={CY} x2={K.x} y2={K.y}
              stroke="#06a5a5" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.6" />
            <line ref={s3} x1={CX} y1={CY} x2={R.x} y2={R.y}
              stroke="#06a5a5" strokeWidth="1.5" strokeDasharray="6 5" strokeOpacity="0.6" />

            {/* Midpoint markers */}
            <circle cx={(W.x + K.x) / 2} cy={(W.y + K.y) / 2} r="2.5" fill="#06a5a5" fillOpacity="0.35" />
            <circle cx={(W.x + R.x) / 2} cy={(W.y + R.y) / 2} r="2.5" fill="#06a5a5" fillOpacity="0.35" />
            <circle cx={(K.x + R.x) / 2} cy={(K.y + R.y) / 2} r="2.5" fill="#06a5a5" fillOpacity="0.35" />

            {/* Node endpoint dots */}
            <circle cx={W.x} cy={W.y} r="3.5" fill="#06a5a5" fillOpacity="0.45" />
            <circle cx={K.x} cy={K.y} r="3.5" fill="#06a5a5" fillOpacity="0.45" />
            <circle cx={R.x} cy={R.y} r="3.5" fill="#06a5a5" fillOpacity="0.45" />
          </svg>

          {/* Center — MotoDigital Logo */}
          <div className="absolute" style={{ left: '50%', top: CY - 32, transform: 'translateX(-50%)' }}>
            <div className="relative w-16 h-16">
              <div className="md-ring" />
              <div className="md-ring md-ring-2" />
              <div className="md-logo relative w-16 h-16 rounded-full bg-[#06a5a5] flex items-center justify-center z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2834.6 2834.6" width="28" height="28">
                  <path fill="white" d={LOGO_PATH} />
                </svg>
              </div>
            </div>
          </div>

          {/* Werkstatt — top left */}
          <div className="md-node md-n0 absolute flex flex-col items-center gap-3" style={{ left: 18, top: 12 }}>
            <div className="w-48 h-36 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden p-3">
              <img src="/custom-werkstatt.png" alt="Werkstatt" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#06a5a5]">01</p>
              <p className="text-xs font-bold text-white/70 mt-0.5">Werkstatt</p>
            </div>
          </div>

          {/* Käufer — top right */}
          <div className="md-node md-n1 absolute flex flex-col items-center gap-3" style={{ right: 18, top: 12 }}>
            <div className="w-48 h-36 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden p-3">
              <img src="/custom-bikes.png" alt="Käufer" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#06a5a5]">02</p>
              <p className="text-xs font-bold text-white/70 mt-0.5">Bike Käufer</p>
            </div>
          </div>

          {/* Rider — bottom center, top=371 centers card on dot y=435 */}
          <div className="md-node md-n2 absolute flex flex-col items-center gap-3" style={{ left: 'calc(50% - 96px)', top: 363 }}>
            <div className="w-48 h-36 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden p-3">
              <img src="/rider.png" alt="Rider" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#06a5a5]">03</p>
              <p className="text-xs font-bold text-white/70 mt-0.5">Rider</p>
            </div>
          </div>

        </div>{/* end desktop triangle */}

      </div>
    </section>
  )
}

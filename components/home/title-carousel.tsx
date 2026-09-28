"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { BarChart3, Coins, Trophy, Users, CalendarDays, Sparkles } from "lucide-react";

type Slide = {
  label: string;
  tagline: string;
  href: string;
  icon: React.ReactNode;
  accent: string; // tailwind gradient classes
};

const slides: Slide[] = [
  { label: "Fines", tagline: "Team fines logged.", href: "/fines", icon: <Coins className="h-7 w-7" />, accent: "from-amber-500/25 to-orange-500/10" },
  { label: "Players", tagline: "Profiles, form and history.", href: "/players", icon: <Users className="h-7 w-7" />, accent: "from-sky-500/25 to-blue-500/10" },
  { label: "Matches", tagline: "Fixtures, results, live scoring.", href: "/fixtures", icon: <Trophy className="h-7 w-7" />, accent: "from-emerald-500/25 to-green-500/10" },
  { label: "League", tagline: "League results that update weekly.", href: "/fixtures/league-table", icon: <Sparkles className="h-7 w-7" />, accent: "from-violet-500/25 to-fuchsia-500/10" },
  { label: "Schedule", tagline: "Plan the whole season ahead.", href: "/fixtures/schedule", icon: <CalendarDays className="h-7 w-7" />, accent: "from-rose-500/25 to-pink-500/10" },
  { label: "Reports", tagline: "Insights the captain actually wants.", href: "/reports", icon: <BarChart3 className="h-7 w-7" />, accent: "from-cyan-500/25 to-teal-500/10" },
];

const COUNT = slides.length;
const STEP = 360 / COUNT;

type Dims = { radius: number; cardW: number; cardH: number; boxW: number; boxH: number };

const DIMS_DESKTOP: Dims = { radius: 290, cardW: 240, cardH: 170, boxW: 260, boxH: 180 };
const DIMS_TABLET: Dims = { radius: 215, cardW: 215, cardH: 155, boxW: 240, boxH: 172 };
const DIMS_MOBILE: Dims = { radius: 135, cardW: 175, cardH: 130, boxW: 195, boxH: 140 };

export function TitleCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<Dims>(DIMS_DESKTOP);

  // Scroll progress across the carousel section drives the ring rotation.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrollAngle = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const smoothScroll = useSpring(scrollAngle, { stiffness: 60, damping: 20, mass: 0.5 });

  // Continuous idle spin + a manual offset from the arrow controls, combined with scroll.
  const rotateY = useMotionValue(0);
  const manualAngle = useRef(0);
  const lastTime = useRef(0);

  useAnimationFrame((t) => {
    const dt = lastTime.current ? (t - lastTime.current) / 1000 : 0;
    lastTime.current = t;
    manualAngle.current += dt * 6; // ~6°/s gentle drift
    rotateY.set(manualAngle.current + smoothScroll.get());
  });

  useEffect(() => {
    const setResponsiveDims = () => {
      const w = window.innerWidth;
      setDims(w < 480 ? DIMS_MOBILE : w < 768 ? DIMS_TABLET : DIMS_DESKTOP);
    };
    setResponsiveDims();
    window.addEventListener("resize", setResponsiveDims);
    return () => window.removeEventListener("resize", setResponsiveDims);
  }, []);

  const nudge = (dir: number) => {
    manualAngle.current += dir * STEP;
  };

  return (
    <section ref={sectionRef} className="relative h-[110vh]">
      {/* Sticky stage is only as tall as its content (not the full viewport) so
          there's no empty space beneath it before the next section. No overflow
          clipping here, so the ambient glow can bleed softly past the edges. */}
      <div className="sticky top-[75px] flex flex-col items-center overflow-x-clip pt-6 pb-8 sm:pt-10">
        {/* Ambient glow — extends beyond the stage so it fades out at the edges */}
        <div className="pointer-events-none absolute -inset-x-40 -inset-y-32 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          The team platform
        </p>
        <h2 className="mb-10 max-w-xl px-6 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything your darts team needs, in one place
        </h2>

        {/* 3D ring — the wrapper clips side cards so they can't overflow the
            viewport, and touch-action: pan-y keeps vertical finger-scroll working. */}
        <div
          className="relative flex w-full items-center justify-center overflow-hidden"
          style={{ height: dims.boxH + 150, touchAction: "pan-y" }}
        >
          <div
            className="relative"
            style={{ perspective: 1200, width: dims.boxW, height: dims.boxH }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", rotateY }}
            >
              {slides.map((slide, i) => (
                <Card
                  key={slide.label}
                  slide={slide}
                  index={i}
                  radius={dims.radius}
                  cardW={dims.cardW}
                  cardH={dims.cardH}
                  rotateY={rotateY}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center gap-3">
          <button
            onClick={() => nudge(1)}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/60 backdrop-blur transition-colors hover:border-primary hover:text-primary"
          >
            ‹
          </button>
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <button
            onClick={() => nudge(-1)}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/60 backdrop-blur transition-colors hover:border-primary hover:text-primary"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

function Card({
  slide,
  index,
  radius,
  cardW,
  cardH,
  rotateY,
}: {
  slide: Slide;
  index: number;
  radius: number;
  cardW: number;
  cardH: number;
  rotateY: ReturnType<typeof useMotionValue<number>>;
}) {
  const baseAngle = index * STEP;

  // How close this card is to facing the viewer (0 = dead centre, 180 = behind).
  const facing = useTransform(rotateY, (r) => {
    const diff = Math.abs(((baseAngle + r) % 360 + 360) % 360);
    return Math.min(diff, 360 - diff);
  });
  const opacity = useTransform(facing, [0, 70, 120, 180], [1, 0.7, 0.25, 0.12]);
  const scale = useTransform(facing, [0, 90, 180], [1, 0.85, 0.7]);

  return (
    // Positioning layer: raw transform string so rotateY happens BEFORE translateZ
    // (framer's individual transform props would reorder these and break the ring).
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transformStyle: "preserve-3d",
        transform: `translate(-50%, -50%) rotateY(${baseAngle}deg) translateZ(${radius}px)`,
      }}
    >
      {/* Animation layer: scale/opacity driven by how much the card faces the viewer. */}
      <motion.div style={{ opacity, scale }}>
        <Link href={slide.href} className="block">
          <div
            style={{ width: cardW, height: cardH }}
            className={`group relative flex flex-col justify-between rounded-2xl border bg-gradient-to-br ${slide.accent} bg-card/80 p-5 shadow-xl backdrop-blur-sm transition-colors hover:border-primary sm:p-6`}
          >
            <div className="flex items-center gap-3 text-foreground">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border bg-background/70">
                {slide.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{slide.label}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{slide.tagline}</p>
            </div>
            <span className="absolute right-5 top-5 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              Open →
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

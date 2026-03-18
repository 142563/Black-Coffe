"use client";

import Image from "next/image";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useRef } from "react";

const CUP_CLIP_PATH = "polygon(12% 0%, 88% 0%, 76% 100%, 24% 100%)";

const PARTICLES = [
  { left: "24%", top: "18%", size: 3, delay: 0.1, duration: 7.2, driftX: -4 },
  { left: "36%", top: "12%", size: 2, delay: 1.4, duration: 6.8, driftX: 3 },
  { left: "63%", top: "16%", size: 2, delay: 0.9, duration: 7.8, driftX: -2 },
  { left: "71%", top: "28%", size: 3, delay: 2.2, duration: 8.5, driftX: 5 },
  { left: "30%", top: "34%", size: 2, delay: 1.8, duration: 6.9, driftX: -3 },
  { left: "58%", top: "38%", size: 2, delay: 2.8, duration: 7.4, driftX: 2 },
];

export function HeroScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const tiltX = useSpring(0, { stiffness: 120, damping: 18, mass: 0.8 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 18, mass: 0.8 });
  const driftX = useSpring(0, { stiffness: 90, damping: 20, mass: 0.9 });
  const driftY = useSpring(0, { stiffness: 90, damping: 20, mass: 0.9 });
  const glowX = useSpring(0, { stiffness: 80, damping: 18, mass: 1 });
  const glowY = useSpring(0, { stiffness: 80, damping: 18, mass: 1 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !stageRef.current) {
      return;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    tiltX.set(-py * 5.5);
    tiltY.set(px * 7.2);
    driftX.set(px * 13);
    driftY.set(py * 7);
    glowX.set(px * 40);
    glowY.set(py * 28);
  }

  function resetPointer() {
    tiltX.set(0);
    tiltY.set(0);
    driftX.set(0);
    driftY.set(0);
    glowX.set(0);
    glowY.set(0);
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-[12%] h-[16rem] w-[16rem] -translate-x-1/2 rounded-full bg-[#d8a15b]/22 blur-[72px]"
        style={{ x: glowX, y: glowY }}
      />
      <motion.div
        className="absolute left-1/2 top-[15%] h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#5a3210]/20 blur-[110px]"
        style={{ x: glowX, y: glowY }}
      />
      <motion.div
        className="absolute left-1/2 top-[14%] h-[10rem] w-[10rem] -translate-x-1/2 rounded-full bg-white/7 blur-[44px]"
        style={{ x: glowX, y: glowY }}
      />
      <motion.div
        className="absolute left-1/2 top-[17%] h-[16rem] w-[8rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#fff7e1_0%,rgba(255,247,225,0.18)_28%,rgba(255,247,225,0)_72%)] blur-[44px]"
        style={{ x: glowX, y: glowY }}
      />

      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        className="pointer-events-auto absolute left-1/2 top-[6.1rem] h-[26rem] w-[min(22rem,54vw)] -translate-x-1/2 sm:top-[7rem] sm:h-[30rem] sm:w-[min(26rem,42vw)]"
        style={{ perspective: "1600px" }}
      >
        {PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            className="absolute rounded-full bg-[#f2d7ad]/55"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              filter: "blur(0.4px)",
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -14, -24],
                    x: [0, particle.driftX, particle.driftX * 1.6],
                    opacity: [0, 0.35, 0],
                    scale: [0.8, 1, 0.9],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: particle.duration,
                    repeat: Infinity,
                    delay: particle.delay,
                    ease: "easeOut",
                  }
            }
          />
        ))}

        <motion.div
          initial={reduceMotion ? false : { y: -240, rotateZ: -8, rotateY: -16, opacity: 0, scale: 0.8 }}
          animate={
            reduceMotion
              ? { y: 0, rotateZ: -0.4, rotateY: 0, opacity: 1, scale: 1 }
              : {
                  y: [-240, 14, -4, 0],
                  rotateZ: [-8, 1.8, -0.9, -0.4],
                  rotateY: [-16, 8, -3, 0],
                  opacity: [0, 1, 1, 1],
                  scale: [0.8, 1.03, 0.995, 1],
                }
          }
          transition={{
            duration: 1.35,
            ease: "easeOut",
            times: reduceMotion ? undefined : [0, 0.72, 0.88, 1],
          }}
          style={{ rotateX: tiltX, rotateY: tiltY, x: driftX, y: driftY, transformStyle: "preserve-3d" }}
          className="relative h-full w-full"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -10, 0], rotateZ: [-0.4, 0.3, -0.4], rotateY: [0, 1.2, 0] }}
            transition={reduceMotion ? undefined : { duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="absolute left-1/2 top-[1.55rem] h-[2.6rem] w-[11.8rem] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(circle_at_50%_22%,#3e4046_0%,#18191d_58%,#09090a_100%)] shadow-[0_18px_38px_rgba(0,0,0,0.5)] sm:w-[13.4rem]" />
            <div className="absolute left-1/2 top-[2.5rem] h-[1.08rem] w-[12.8rem] -translate-x-1/2 rounded-[999px] bg-[linear-gradient(180deg,#2d2f33_0%,#141518_100%)] sm:w-[14.4rem]" />
            <div className="absolute left-1/2 top-[3.1rem] h-[0.76rem] w-[13.2rem] -translate-x-1/2 rounded-[999px] bg-[linear-gradient(180deg,#17181a_0%,#0b0b0d_100%)] shadow-[0_10px_22px_rgba(0,0,0,0.42)] sm:w-[14.8rem]" />
            <div className="absolute left-1/2 top-[1.92rem] h-[0.22rem] w-[2.2rem] -translate-x-1/2 rounded-full bg-black/80 blur-[0.2px]" />
            <div className="absolute left-1/2 top-[1.7rem] h-[0.18rem] w-[5.8rem] -translate-x-1/2 rounded-full bg-white/10 blur-[0.4px]" />

            <div
              className="absolute left-1/2 top-[3.55rem] h-[17.2rem] w-[13.3rem] -translate-x-1/2 overflow-hidden shadow-[0_34px_92px_rgba(0,0,0,0.34)] sm:h-[19rem] sm:w-[14.8rem]"
              style={{ clipPath: CUP_CLIP_PATH }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(92deg,#8b5424_0%,#d7aa70_16%,#f4dfb9_31%,#f6ead0_44%,#d8af76_60%,#a86c36_82%,#6e3f18_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.08)_16%,rgba(255,255,255,0)_34%,rgba(0,0,0,0.06)_100%)]" />
              <div className="absolute left-[16%] top-[6%] h-[66%] w-[12%] rounded-full bg-[linear-gradient(180deg,rgba(255,251,243,0)_0%,rgba(255,251,243,0.78)_30%,rgba(255,251,243,0)_100%)] blur-[0.65px]" />
              <div className="absolute left-[26%] top-[10%] h-[52%] w-[2.8%] rounded-full bg-white/22 blur-[0.3px]" />
              <div className="absolute right-[10%] top-[0] h-[74%] w-[18%] rounded-full bg-[linear-gradient(180deg,rgba(89,52,19,0)_0%,rgba(89,52,19,0.18)_28%,rgba(59,32,10,0.44)_100%)]" />
              <div className="absolute left-[42%] top-0 h-full w-[10%] rounded-full bg-white/4 blur-[8px]" />
              <div className="absolute inset-x-[16%] top-[2%] h-[4.5%] rounded-full bg-white/14 blur-[0.35px]" />
              <div className="absolute inset-x-[18%] bottom-[2.6%] h-[10%] rounded-[50%] bg-[radial-gradient(circle_at_50%_28%,rgba(249,234,204,0.82),rgba(249,234,204,0.0)_72%)] opacity-76" />
            </div>

            <div className="absolute left-1/2 top-[11rem] h-[2.9rem] w-[2.9rem] -translate-x-1/2 rounded-[1rem] border border-[#d5b178]/14 bg-black/82 p-[0.34rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_18px_34px_rgba(0,0,0,0.34)] backdrop-blur sm:top-[12.2rem] sm:h-[3.15rem] sm:w-[3.15rem]">
              <Image
                src="/brand/logo-black-coffe.jpeg"
                alt="Black Coffe"
                width={48}
                height={48}
                className="h-full w-full rounded-[0.8rem] object-cover"
              />
            </div>

            <div className="absolute left-1/2 top-[22.4rem] h-[1.35rem] w-[7.5rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#2c1708_0%,#120a05_60%,rgba(0,0,0,0)_100%)] opacity-42 blur-[9px] sm:top-[24.6rem] sm:w-[8.3rem]" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

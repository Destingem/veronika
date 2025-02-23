'use client'
import { useCallback } from "react";
import Particles from "react-particles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

interface MoodParticlesProps {
  colors: string[];
}

export default function MoodParticles({ colors }: MoodParticlesProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const moodItems = ["🧪", "🚬", "🍷", "🐩", "💅", "🧘‍♀️", "💋", "👠", "🌹", "🌙", "V", "E", "R", "O", "N", "I", "K", "A", "💉"];

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fps_limit: 60,
        particles: {
          number: {
            value: 30, // Snížený počet částic
            density: {
              enable: true,
              value_area: 1000,
            },
          },
          color: {
            value: "#ffffff"
          },
          shape: {
            type: "character",
            character: {
              value: moodItems,
              font: "Verdana",
              style: "",
              weight: "400",
              fill: true,
            },
          },
          opacity: {
            value: 0.7,
            random: false,
            animation: {
              enable: true,
              speed: 0.3,
              minimumValue: 0.4,
              sync: false
            }
          },
          size: {
            value: { min: 15, max: 25 }, // Menší velikost
            random: true
          },
          move: {
            enable: true,
            speed: 1.5, // Pomalejší pohyb
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "bounce"
            },
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          },
          rotate: {
            value: 0,
            direction: "clockwise",
            animation: {
              enable: true,
              speed: 3, // Pomalejší rotace
              sync: false
            }
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onHover: {
              enable: true,
              mode: "repulse"
            },
            resize: true
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4
            }
          }
        },
        retina_detect: false, // Vypnutí detekce retina displeje pro lepší výkon
        background: {
          color: colors[0],
          opacity: 1
        }
      }}
      className="absolute inset-0 -z-10 transition-all duration-1000"
    />
  );
}

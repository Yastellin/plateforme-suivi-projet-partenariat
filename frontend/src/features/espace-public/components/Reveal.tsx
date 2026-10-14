// src/features/espace-public/components/Reveal.tsx
import type { ReactNode } from "react"
import { motion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

// Animations d'apparition au scroll de la vitrine publique (framer-motion).
// Les utilisateurs ayant activé "réduire les animations" sont gérés par
// <MotionConfig reducedMotion="user"> dans le layout public.

const TRANSITION = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }

const variantsConteneur: Variants = {
  cache: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const variantsElement: Variants = {
  cache: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: TRANSITION },
}

const VIEWPORT = { once: true, margin: "-60px" } as const

interface RevealProps {
  children: ReactNode
  className?: string
  delai?: number
}

// Élément unique : fondu + glissement à l'entrée dans le viewport.
export function Reveal({ children, className, delai = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="cache"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        cache: variantsElement.cache,
        visible: { opacity: 1, y: 0, transition: { ...TRANSITION, delay: delai } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Conteneur qui échelonne l'apparition de ses enfants <RevealItem>.
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn(className)}
      initial="cache"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={variantsConteneur}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={variantsElement}>
      {children}
    </motion.div>
  )
}

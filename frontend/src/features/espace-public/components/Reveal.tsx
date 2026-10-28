// src/features/espace-public/components/Reveal.tsx
import { createContext, useContext, type ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

export type DirectionReveal = "up" | "left" | "right"

const CONTEXTE_DIRECTION = createContext<DirectionReveal>("up")
const TRANSITION = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }
const VIEWPORT = { once: true, amount: 0.15 } as const
const DEPLACEMENT = 24

function variantesElement(direction: DirectionReveal): Variants {
  const depart = direction === "up"
    ? { y: DEPLACEMENT }
    : direction === "left"
      ? { x: DEPLACEMENT }
      : { x: -DEPLACEMENT }

  return {
    cache: { opacity: 0, ...depart },
    visible: { opacity: 1, x: 0, y: 0, transition: TRANSITION },
  }
}

interface RevealProps {
  children: ReactNode
  className?: string
  delai?: number
  direction?: DirectionReveal
}

export function Reveal({ children, className, delai = 0, direction = "up" }: RevealProps) {
  const reduire = useReducedMotion()
  if (reduire) return <div className={className}>{children}</div>

  const variantes = variantesElement(direction)
  return (
    <motion.div
      className={className}
      initial="cache"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        cache: variantes.cache,
        visible: { ...variantes.visible, transition: { ...TRANSITION, delay: delai } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealGroup({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode
  className?: string
  direction?: DirectionReveal
}) {
  const reduire = useReducedMotion()
  if (reduire) {
    return <div className={className}>{children}</div>
  }

  return (
    <CONTEXTE_DIRECTION.Provider value={direction}>
      <motion.div
        className={cn(className)}
        initial="cache"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{
          cache: {},
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
        }}
      >
        {children}
      </motion.div>
    </CONTEXTE_DIRECTION.Provider>
  )
}

export function RevealItem({
  children,
  className,
  direction,
}: {
  children: ReactNode
  className?: string
  direction?: DirectionReveal
}) {
  const reduire = useReducedMotion()
  const directionGroupe = useContext(CONTEXTE_DIRECTION)
  if (reduire) return <div className={className}>{children}</div>

  return (
    <motion.div className={className} variants={variantesElement(direction ?? directionGroupe)}>
      {children}
    </motion.div>
  )
}

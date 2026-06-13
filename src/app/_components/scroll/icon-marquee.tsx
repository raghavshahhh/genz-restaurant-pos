"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface IconMarqueeProps {
  items: ReactNode[]
  speed?: number
  reverse?: boolean
}

export function IconMarquee({ items, speed = 30, reverse = false }: IconMarqueeProps) {
  return (
    <div className="overflow-hidden py-4">
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex gap-6 w-max"
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="shrink-0 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 hover:border-lime-500/30 transition-colors">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-4"
    >
      <Card className={cn("border-0 shadow-2xl backdrop-blur-sm bg-card/95", className)}>
        <CardHeader className="space-y-1 text-center px-4 md:px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-balance">{title}</CardTitle>
            {description && (
              <CardDescription className="text-muted-foreground text-pretty text-sm md:text-base">
                {description}
              </CardDescription>
            )}
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 md:px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            {children}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

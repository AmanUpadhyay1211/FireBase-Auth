"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    const newChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    setChecks(newChecks)
    
    const score = Object.values(newChecks).filter(Boolean).length
    setStrength(score)
  }, [password])

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = () => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getStrengthColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {getStrengthText()}
        </span>
      </div>

      <div className="space-y-1">
        {Object.entries(checks).map(([key, passed]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 text-sm ${
              passed ? "text-green-600 dark:text-green-400" : "text-gray-500"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                passed
                  ? "border-green-600 dark:border-green-400 bg-green-600 dark:bg-green-400"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {passed && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </motion.svg>
              )}
            </div>
            <span>
              {key === "length" && "At least 8 characters"}
              {key === "uppercase" && "One uppercase letter"}
              {key === "lowercase" && "One lowercase letter"}
              {key === "number" && "One number"}
              {key === "special" && "One special character"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

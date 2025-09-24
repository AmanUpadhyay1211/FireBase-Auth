"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          {/* Hero Section */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-balance">
              Modern Authentication
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
              Experience seamless authentication with Firebase, MongoDB backup, and JWT sessions. Built with Next.js 15
              and modern web technologies.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gradient-purple hover:opacity-90 transition-opacity font-medium px-6 md:px-8"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium px-6 md:px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:gap-8 mt-12 md:mt-16 px-4 sm:grid-cols-1 md:grid-cols-3">
            <div className="space-y-4 p-4 md:p-6 rounded-lg border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-center md:text-left">Secure Authentication</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center md:text-left">
                Firebase Auth with Google and GitHub OAuth, plus secure JWT session management.
              </p>
            </div>

            <div className="space-y-4 p-4 md:p-6 rounded-lg border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-center md:text-left">MongoDB Backup</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center md:text-left">
                Reliable data backup with MongoDB and fallback authentication when Firebase is unavailable.
              </p>
            </div>

            <div className="space-y-4 p-4 md:p-6 rounded-lg border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-center md:text-left">Modern UI</h3>
              <p className="text-sm md:text-base text-muted-foreground text-center md:text-left">
                Beautiful, responsive design with smooth animations and dark/light mode support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

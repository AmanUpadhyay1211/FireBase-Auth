"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Globe, Mail, User, Key, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { AuthRequiredRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"

function DashboardPageContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // This component is wrapped in AuthRequiredRoute, so user should never be null
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleResetPassword = () => {
    router.push("/auth/reset-password")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Welcome Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="text-xl md:text-2xl bg-primary/10">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || (
                        <User className="w-6 h-6 md:w-8 md:h-8" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-balance">
                      Welcome to Your Dashboard
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground text-pretty">
                      Welcome back, {user.displayName || user.email}! You're successfully signed in with{" "}
                      {user.provider === "email" ? "email" : user.provider}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Info Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Your Account Information</CardTitle>
                <CardDescription>Details about your authenticated session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm bg-muted p-3 rounded-md break-all">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm bg-muted p-3 rounded-md">{user.displayName || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Provider</label>
                    <p className="text-sm bg-muted p-3 rounded-md capitalize">{user.provider}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="text-xs md:text-sm bg-muted p-3 rounded-md font-mono break-all">{user.uid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Actions Card - Only for email/password users */}
          {user.provider === "email" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account security and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">Password Security</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Since you signed in with email and password, you can reset your password if needed.
                          </p>
                          <Button
                            onClick={handleResetPassword}
                            variant="outline"
                            size="sm"
                            className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Reset Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Professional Links Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Professional Links</CardTitle>
                <CardDescription>Connect with me on various platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <motion.a
                    href="https://github.com/AmanUpadhyay1211"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Github className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">GitHub</span>
                  </motion.a>

                  <motion.a
                    href="https://www.linkedin.com/in/allthingsaman"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Linkedin className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">LinkedIn</span>
                  </motion.a>

                  <motion.a
                    href="https://portfolio-fawn-pi-29.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Globe className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Portfolio</span>
                  </motion.a>

                  <motion.a
                    href="mailto:amanupadhyay1211@gmail.com"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Email</span>
                  </motion.a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tech Stack Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Tech Stack</CardTitle>
                <CardDescription>Technologies used in this authentication system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    "Next.js 15",
                    "React 18",
                    "TypeScript",
                    "Tailwind CSS",
                    "Firebase Auth",
                    "MongoDB",
                    "JWT Sessions",
                    "Framer Motion",
                  ].map((tech, index) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-primary/5 text-primary px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium text-center"
                    >
                      {tech}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthRequiredRoute>
      <DashboardPageContent />
    </AuthRequiredRoute>
  )
}

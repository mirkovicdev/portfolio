"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function ProblemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 text-zinc-400 hover:text-phthalo-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-phthalo-400 to-phthalo-600">
            Problem Management
          </h1>
          <p className="text-zinc-400">View, create, and manage problems for quantframe</p>
        </div>

        {/* Problem Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Link href="/admin/problems/math">
            <Card className="group cursor-pointer bg-zinc-900/50 border-zinc-800 hover:border-phthalo-500 transition-all duration-300 p-8 h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-phthalo-500/20 border-2 border-phthalo-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">∑</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-phthalo-400 transition-colors">
                  Math Problems
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Questions with text input answers, hints, and solutions
                </p>
                <div className="text-xs text-zinc-500">
                  View all • Add new • Preview rendering
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/problems/coding">
            <Card className="group cursor-pointer bg-zinc-900/50 border-zinc-800 hover:border-blue-500 transition-all duration-300 p-8 h-full">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">&lt;/&gt;</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  Coding Problems
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Python problems with starter code and test cases
                </p>
                <div className="text-xs text-zinc-500">
                  View all • Add new • Manage test cases
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

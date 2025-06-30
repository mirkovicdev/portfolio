import Link from "next/link"
import { ArrowRight, Github, Linkedin, Mail, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/project-card"
import { SkillBadge } from "@/components/skill-badge"
import { Timeline } from "@/components/timeline"
import { ContactForm } from "@/components/contact-form"
import { CreativeHero } from "@/components/creative-hero"
import { FloatingNav } from "@/components/floating-nav"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { SectionHeading } from "@/components/section-heading"
import { GlassmorphicCard } from "@/components/glassmorphic-card"
import { GrindSection } from "@/components/grind-section"
import { KnowledgeBrain } from "@/components/knowledge-brain"
import { Marquee } from "@/components/magicui/marquee"

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white overflow-hidden">
      <MouseFollower />
      <ScrollProgress />
      <FloatingNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-0">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-phthalo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-phthalo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-phthalo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container relative z-10 px-4 sm:px-6">
          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-8">
            {/* 1. Name first */}
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span className="block">Hi, I'm</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-phthalo-400 to-phthalo-600">
                Antonije Mirkovic
              </span>
            </h1>
            
            {/* 2. Profile image */}
            <div className="flex justify-center">
              <CreativeHero />
            </div>
            
            {/* 3. Software engineer badge */}
            <div className="flex justify-center">
              <div className="relative px-3 py-1 text-xs font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="relative z-10">Software Engineer & Quantitative Developer</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-phthalo-500/20 to-phthalo-700/20 animate-pulse"></span>
              </div>
            </div>

            {/* 4. Description */}
            <p className="text-lg text-zinc-400 max-w-[600px]">
              I blend advanced mathematics, machine learning, and full-stack engineering to turn complex ideas into real-world tools.
            </p>
            
            {/* 5. Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 justify-center">
              <Link href="#projects">
                <Button className="relative overflow-hidden group bg-gradient-to-r from-phthalo-600 to-phthalo-800 border-0">
                  <span className="relative z-10 flex items-center">
                    View Projects <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-phthalo-700 to-phthalo-900 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Button>
              </Link>
              <Link href="#contact">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 bg-transparent"
                >
                  Contact Me
                </Button>
              </Link>
            </div>
            
            {/* 6. Social icons */}
            <div className="flex gap-4 justify-center">
              <Link href="https://github.com/mirkovicdev" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Button>
              </Link>
              <Link href="https://www.linkedin.com/in/amirkovic" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
              </Link>
              <Link href="mailto:antonije@mirkovic.no">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <div className="inline-block">
                <div className="relative px-3 py-1 text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                  <span className="relative z-10">Software Engineer & Quantitative Developer</span>
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-phthalo-500/20 to-phthalo-700/20 animate-pulse"></span>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="block">Hi, I'm</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-phthalo-400 to-phthalo-600">
                  Antonije Mirkovic
                </span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-[600px]">
                I blend advanced mathematics, machine learning, and full-stack engineering to turn complex ideas into real-world tools.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="#projects">
                  <Button className="relative overflow-hidden group bg-gradient-to-r from-phthalo-600 to-phthalo-800 border-0">
                    <span className="relative z-10 flex items-center">
                      View Projects <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-phthalo-700 to-phthalo-900 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Button>
                </Link>
                <Link href="#contact">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 bg-transparent"
                  >
                    Contact Me
                  </Button>
                </Link>
              </div>
              <div className="flex gap-4 pt-4">
                <Link href="https://github.com/mirkovicdev" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </Button>
                </Link>
                <Link href="https://www.linkedin.com/in/amirkovic" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </Button>
                </Link>
                <Link href="mailto:antonije@mirkovic.no">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="sr-only">Email</span>
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <CreativeHero />
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center items-start p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-phthalo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-phthalo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title="About Me" subtitle="My background and journey" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <div className="relative">
              <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-phthalo-500/20 to-phthalo-700/20 blur-xl opacity-70"></div>
              <div className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800">
                <img
                  src="/image.jpg"
                  alt="Shine Kyaw Kyaw Aung"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium">Available for work</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <GlassmorphicCard>
                <p className="text-lg text-zinc-300">
                  I'm a second-year student in  M.Sc physics and mathematics, specializing in industrial mathematics. I build full-stack tools that sit directly on top of deep math, whether it's a real-time arrythmia classifier, a quant backtester, or a LaTeX-aware AI pipeline.
                </p>
                <p className="text-lg text-zinc-300 mt-4">
                  In 2024, I was diagnosed with heart failure. While recovering, I kept studying, training, and coding, often while dealing with irregular heartbeats that showed up on my own ECG data. That experience pushed me to focus on building systems that actually matter. Tools that monitor, predict, or automate something critical in real life.
                </p>
                <p className="text-lg text-zinc-300 mt-4">
                  I work mostly in Next.js, Python, and C++, and my current focus is split between real-time arrhythmia detection, cardinality-constrained portfolio optimization, and high-frequency crypto strategies using custom indicators and BTC context logic. I'm here to solve hard problems, not polish pitch decks.
                </p>



                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">Name</div>
                    <div className="font-medium">Antonije Mirkovic</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">Email</div>
                    <div className="font-medium break-all">antonije@mirkovic.no</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">Location</div>
                    <div className="font-medium">Trondheim, Norway</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-zinc-500">Availability</div>
                    <div className="font-medium text-green-500">Open to opportunities</div>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="/Antonije_CV.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md"
                  >
                    View CV
                  </a>

                </div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-phthalo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title="My Skills" subtitle="Technologies I work with" />

          {/* Desktop: Two horizontal rows */}
          <div className="hidden md:block mt-16">
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
              <Marquee pauseOnHover className="[--duration:20s]">
                <SkillBadge name="JavaScript" level={100} />
                <SkillBadge name="TypeScript" level={100} />
                <SkillBadge name="React" level={100} />
                <SkillBadge name="Next.js" level={100} />
                <SkillBadge name="Python" level={100} />
                <SkillBadge name="HTML/CSS" level={100} />
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]">
                <SkillBadge name="Tailwind CSS" level={100} />
                <SkillBadge name="LaTeX" level={100} />
                <SkillBadge name="C++" level={95} />
                <SkillBadge name="PostgreSQL" level={75} />
                <SkillBadge name="Julia" level={60} />
                <SkillBadge name="Git" level={60} />
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-zinc-900"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-zinc-900"></div>
            </div>
          </div>

          {/* Mobile: Two vertical columns */}
          <div className="md:hidden mt-16">
            <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden">
              <Marquee pauseOnHover vertical className="[--duration:20s]">
                <SkillBadge name="JavaScript" level={100} />
                <SkillBadge name="TypeScript" level={100} />
                <SkillBadge name="React" level={100} />
                <SkillBadge name="Next.js" level={100} />
                <SkillBadge name="Python" level={100} />
                <SkillBadge name="HTML/CSS" level={100} />
              </Marquee>
              <Marquee reverse pauseOnHover vertical className="[--duration:20s]">
                <SkillBadge name="Tailwind CSS" level={100} />
                <SkillBadge name="LaTeX" level={100} />
                <SkillBadge name="C++" level={95} />
                <SkillBadge name="PostgreSQL" level={75} />
                <SkillBadge name="Julia" level={60} />
                <SkillBadge name="Git" level={60} />
              </Marquee>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-zinc-900"></div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-zinc-900"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-phthalo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title="Featured Projects" subtitle="Some of my recent work" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <ProjectCard
              title="Polar H10 ECG Arrhythmia Detector"
              description="A real-time ECG monitoring application that streams live cardiac data from Polar H10 chest straps and performs intelligent arrhythmia detection using advanced signal processing algorithms. Tracks PVC burden, detects patterns like bigeminy and trigeminy, and supports session-based analysis with planned alarm functionality for high-risk events."
              tags={["Next.js", "TypeScript", "Expo", "Python", "IOS Development"]}
              image="/p4.png?height=400&width=600"
              repoUrl="https://github.com/mirkovicdev/Polar-H10-ECG-IOS-app"
            />


            <ProjectCard
              title="Cardinality-Constrained Portfolio Optimization"
              description="This project explores portfolio optimization under cardinality constraints, where the number of assets selected in a portfolio is explicitly limited. Using integer programming, the project demonstrates how adding a cardinality constraint transforms a convex Markowitz optimization problem into a combinatorial, non-convex challenge."
              tags={["Jupyter", "Python", "NumPy", "CVXPY"]}
              image="/portfolio.png"
              repoUrl="https://github.com/mirkovicdev/Cardinality-Constrained-Portfolio-Optimization"
            />
            <ProjectCard
              title="SOLUSDT signal bot"
              description="A custom algorithmic trading system for Solana using custom signals, enhanced with BTCUSDT price context for confirmation. The strategy includes dynamic stop-loss, ATR-based take-profit, slippage modeling, and realistic funding/fee handling. Backtested on 5-minute candles with live simulation support. It has been deployed live and generated consistent profit in high freq trading environments."
              tags={["Python", "Pandas", "Matplotlib", "Backtesting", "Crypto", "Quant"]}
              image="/trade.png"
            />
            <ProjectCard
              title="Simmerlund Coaching"
              description="A custom-built coaching website for a personal trainer, featuring a clean and responsive UI with registration and contact functionality. The platform serves as a digital entry point for potential clients to sign up for personalized coaching plans."
              tags={["Next.js", "MongoDB", "Tailwind CSS", "Typescript"]}
              image="/coaching.png"
              demoUrl="https://simmerlund.com/"
              repoUrl="https://github.com/mirkovicdev/Simmerlund"
            />

            <ProjectCard
              title="BuildThisNow"
              description="A startup discovery platform that delivers AI-generated business ideas daily. Users can explore, analyze, and expand on startup concepts. I contributed to the frontend architecture, user interaction flow, and content generation logic."
              tags={["Next.js", "Supabase", "TypeScript", "OpenAI API"]}
              image="/btn.png"
              demoUrl="https://buildthisnow.com"
              studioUrl="https://kairoventures.com"
              studioName="Kairo Ventures"
            />

            <ProjectCard
              title="Prompt Fox"
              description="A web platform and Chrome extension designed to enhance and manage AI prompts more effectively. Prompt Fox allows users to save, organize, and inject optimized prompts directly into AI tools. I contributed to both the frontend and backend, as well as the core Chrome extension logic."
              tags={["Plasmo", "Supabase", "Next.js", "TypeScript"]}
              image="/promptfox.png"
              demoUrl="https://prompt-fox.com"
              studioUrl="https://kairoventures.com"
              studioName="Kairo Ventures"
            />

          </div>
        </div>
      </section>

      {/* Grind Section */}
      <section className="py-32 relative" id="grind">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-phthalo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-phthalo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <GrindSection />
        </div>
      </section>

      {/* Knowledge Brain Section */}
      {/* <section className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-phthalo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-phthalo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <KnowledgeBrain />
        </div>
      </section> */}

      {/* Experience Section */}
      <section id="experience" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-phthalo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title="Work Experience" subtitle="My professional journey" />

          <div className="mt-16">
            <Timeline />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-phthalo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-phthalo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="container relative z-10">
          <SectionHeading title="Get In Touch" subtitle="Let's work together" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
            <GlassmorphicCard>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-phthalo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">Email</div>
                    <div className="font-medium">antonije@mirkovic.no</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Linkedin className="h-5 w-5 text-phthalo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">LinkedIn</div>
                    <div className="font-medium">www.linkedin.com/in/amirkovic</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Github className="h-5 w-5 text-phthalo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-zinc-500">GitHub</div>
                    <div className="font-medium">github.com/mirkovicdev</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <h4 className="text-lg font-medium mb-4">Current Status </h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"> </div>
                  <span>Send me a message if you're working on something at the intersection of math, tech, ai and finance!</span>
                </div>
              </div>
            </GlassmorphicCard>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Link href="/" className="font-bold text-xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-phthalo-400 to-phthalo-600">
                Mirkovic
              </span>
              <span className="text-white">Dev</span>
            </Link>
            <p className="text-sm text-zinc-500 mt-2">
              © {new Date().getFullYear()} Antonije Mirkovic. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="https://github.com/mirkovicdev" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Link href="https://www.linkedin.com/in/amirkovic" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </Link>
            <Link href="mailto:antonije@mirkovic.no">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
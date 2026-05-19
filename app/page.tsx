export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto px-6 md:px-12 lg:px-24 pt-24 md:pt-32">
        {/* Work */}
        <section className="pb-24">
          <h2 className="text-sm text-white/40 tracking-wide mb-12">Work</h2>

          <div className="space-y-8">
            <a
              href="https://github.com/mirkovicdev/Polar-H10-ECG-IOS-app"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                Real-time ECG Arrhythmia Detector
              </h3>
              <p className="text-sm text-white/40 mt-1">
                Live PVC detection, neural network classification, workout tracking
              </p>
            </a>

            <a
              href="https://github.com/mirkovicdev/Cardinality-Constrained-Portfolio-Optimization"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                Cardinality-Constrained Portfolio Optimization
              </h3>
              <p className="text-sm text-white/40 mt-1">
                Integer programming, Markowitz optimization under constraints
              </p>
            </a>

            <a
              href="https://github.com/mirkovicdev/CLUSTERING-MARKET-REGIMES"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                Wasserstein K-Means Market Regime Clustering
              </h3>
              <p className="text-sm text-white/40 mt-1">
                Clustering distributions via Wasserstein distance, regime-switching GBM, jump diffusion
              </p>
            </a>

            <div className="block">
              <h3 className="text-lg md:text-xl text-white/90">
                SOLUSDT Signal Bot
              </h3>
              <p className="text-sm text-white/40 mt-1">
                Algorithmic trading, ATR-based exits, slippage modeling
              </p>
            </div>

            <a
              href="https://quantframe.io"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors">
                QuantFrame
              </h3>
              <p className="text-sm text-white/40 mt-1">
                Educational platform for quantitative finance
              </p>
            </a>
          </div>
        </section>

        {/* Contact */}
        <section className="py-24 border-t border-white/10">
          <h2 className="text-sm text-white/40 tracking-wide mb-12">Contact</h2>

          <div className="space-y-4">
            <a
              href="mailto:contact@mirkovic.dev"
              className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
            >
              contact@mirkovic.dev
            </a>

            <a
              href="https://github.com/mirkovicdev"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
            >
              github
            </a>

            <a
              href="https://linkedin.com/in/amirkovic"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
            >
              linkedin
            </a>

            <a
              href="https://instagram.com/mirkovicdev"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-lg md:text-xl text-white/90 hover:text-white transition-colors"
            >
              instagram
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10 text-sm text-white/30">
          Antonije Mirkovic
        </footer>
      </div>
    </main>
  )
}

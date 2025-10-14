import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="arena-container">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Arcade-style INSERT COIN indicator */}
          <div className="mb-8 animate-pulse">
            <span className="inline-block text-xs tracking-widest text-primary/60" style={{fontFamily: '"Press Start 2P", cursive'}}>
              ⚡ INSERT PHILOSOPHY ⚡
            </span>
          </div>
          
          <h1 className="arcade-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6" data-text="DIALECTICAL.CLAIMS">
            DIALECTICAL.CLAIMS
          </h1>
          
          <div className="relative inline-block mb-6">
            <p className="text-xl md:text-2xl mb-2 neon-text" style={{fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.1em'}}>
              ⚔️ THE ARENA OF SYNTHETIC THOUGHT ⚔️
            </p>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          </div>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Transform the history of human thought into an infinite game where ideas evolve,
            collide, and transcend—with you as the <span className="text-accent font-bold">choreographer of consciousness</span> itself.
          </p>

          <div className="flex justify-center mb-12">
            <Link 
              href="/fighters" 
              className="btn btn-primary btn-lg text-base px-12 py-6 group relative overflow-hidden"
            >
              <span className="relative z-10">⚔️ ENTER ARENA ⚔️</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </Link>
          </div>
          
          {/* Retro status bar */}
          <div className="flex justify-center gap-4 text-xs" style={{fontFamily: '"Press Start 2P", cursive'}}>
            <span className="text-green-400">● ONLINE</span>
            <span className="text-primary">● FREE</span>
            <span className="text-accent">● INFINITE</span>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="fighter-card text-center p-8 group hover:scale-105 transition-transform">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-primary rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-full h-full bg-card border-2 border-primary rounded-lg flex items-center justify-center">
                <span className="text-4xl">🥋</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-3 text-primary" style={{fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.05em'}}>
              SELECT FIGHTER
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choose from <span className="text-primary font-bold">70+ philosophical warriors</span> spanning history. 
              Each fighter embodies their unique voice and combat style.
            </p>
          </div>

          <div className="fighter-card text-center p-8 group hover:scale-105 transition-transform">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-accent rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-full h-full bg-card border-2 border-accent rounded-lg flex items-center justify-center">
                <span className="text-4xl">⚔️</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-3 text-accent" style={{fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.05em'}}>
              ENTER ARENA
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Watch <span className="text-accent font-bold">real-time philosophical combat</span>. 
              Ideas clash and evolve, streamed live as dialectical warfare unfolds.
            </p>
          </div>

          <div className="fighter-card text-center p-8 group hover:scale-105 transition-transform">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-secondary rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-full h-full bg-card border-2 border-secondary rounded-lg flex items-center justify-center">
                <span className="text-4xl">💎</span>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-3 text-secondary" style={{fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.05em'}}>
              CLAIM SYNTHESIS
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every battle yields <span className="text-secondary font-bold">emergent syntheses</span>—
              novel integrations that transcend opposition and seed future combat.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            No login required. No voting systems. No artificial scarcity. Ideas are free.
          </p>
        </div>
      </div>
    </div>
  )
}

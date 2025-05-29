"use client";

import { CSVAnalyzer } from "@/components/csv-analyzer";
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart3, FileText, Clock, Sparkles, Github } from "lucide-react";
import { useFeatureGate } from "@statsig/react-bindings";

export default function Home() {
  const { value: heroSectionEnabled } = useFeatureGate("hero_section_enabled");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex flex-col">
      {/* Enhanced Header */}
      <header className="relative bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-xl sticky top-0 z-50 border-b border-border/50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
        
        {/* Subtle top border with gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-between">
            {/* Logo and brand section - compact */}
            <div className="flex items-center space-x-3 group">
              {/* Compact enhanced logo */}
              <div className="relative">
                <div className="h-8 w-8 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                  <BarChart3 className="h-4 w-4 text-primary-foreground" />
                  <Sparkles className="h-2 w-2 text-primary-foreground/60 absolute -top-0.5 -right-0.5" />
                </div>
                {/* Compact glow effect */}
                <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              
              {/* Compact brand text */}
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Data (lol)
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground/90 tracking-wide -mt-0.5">
                  CSV Analytics Platform
                </p>
              </div>
            </div>

            {/* Compact theme toggle area */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section - Conditionally rendered */}
          {heroSectionEnabled && (
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Spreadsheets Are For Losers
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Why not use JavaScript instead? Upload your CSV, get fast calculations with gorgeous visualizations. 
                Process 100MB+ files without breaking a sweat.
              </p>
              
              {/* Enhanced Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-colors transition-shadow transition-transform duration-300 border border-border/50 hover:border-primary/30 hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="font-bold mb-3 text-lg">Date Difference Magic</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Instantly calculate time differences between created and closed dates with precision
                  </p>
                </div>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-colors transition-shadow transition-transform duration-300 border border-border/50 hover:border-primary/30 hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="font-bold mb-3 text-lg">Hour-by-Hour Insights</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Discover patterns in your data by analyzing request creation times
                  </p>
                </div>
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-colors transition-shadow transition-transform duration-300 border border-border/50 hover:border-primary/30 hover:-translate-y-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-bold mb-3 text-lg">Geographic Intelligence</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Map your data geographically with ZIP code analysis and trends
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CSV Analyzer Component */}
          <CSVAnalyzer />
        </div>
      </main>

      {/* Clean, minimal footer */}
      <footer className="mt-auto border-t border-border/50 bg-gradient-to-t from-muted/30 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">Data (lol)</span>
              <span className="text-muted-foreground text-sm">• Built by Aidan L</span>
            </div>
            
            {/* License info */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Open source under</span>
              <a 
                href="https://github.com/Ogyeet10/data-lol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <Github className="h-4 w-4" />
                <span>GPL-3.0</span>
                <svg className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
import Header from "./components/Header";
import MockChat from "./components/MockChat";
import LeadForm from "./components/LeadForm";
import { CheckCircle2, Zap, Users, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: Value Proposition */}
          <div className="space-y-8">
            {/* Main Headline */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wide">
                  AI-Powered Lead Engine
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 tracking-tight leading-tight">
                Turn <span className="text-emerald-400">"I need a roof check"</span> into a{" "}
                <span className="text-emerald-400">booked inspection</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
                Automated AI conversations that qualify leads, answer questions, and
                schedule appointments—while you focus on the roofing work.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">Instant AI responses</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">24/7 availability</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">Human handoff ready</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">Auto-booking flow</span>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-100 uppercase tracking-wide text-sm">
                System Workflow
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-mono text-emerald-400">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-100">Lead capture:</span> Homeowner
                      requests inspection via SMS or web form
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-mono text-emerald-400">2</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-100">AI qualification:</span> Primus
                      AI asks targeted questions (address, roof type, urgency)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-mono text-emerald-400">3</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-100">Auto-booking:</span> When
                      availability is shared, inspection is scheduled automatically
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-mono text-emerald-400">4</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-100">Owner notification:</span> You
                      receive instant SMS with lead details and appointment time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Demo: Mock Chat */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-100 uppercase tracking-wide text-sm">
                Live Conversation Example
              </h2>
              <MockChat />
            </div>
          </div>

          {/* Right Column: Lead Form (Sticky on Desktop) */}
          <div className="lg:sticky lg:top-24">
            <LeadForm />

            {/* System Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400 font-mono">~10s</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                  Response Time
                </p>
              </div>
              <div className="text-center p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400 font-mono">24/7</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                  Availability
                </p>
              </div>
              <div className="text-center p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-2xl font-bold text-emerald-400 font-mono">95%</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                  Qualification
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs Section */}
        <div className="mt-20 pt-12 border-t border-slate-800">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-100 mb-2">
              Technical Specifications
            </h2>
            <p className="text-slate-400 font-mono text-sm">
              PRIMUS OS ARCHITECTURE
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-wide mb-3">
                Backend Stack
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Node.js + Express API
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  OpenAI GPT-4 Integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Twilio SMS Gateway
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Google Calendar API
                </li>
              </ul>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-wide mb-3">
                AI Capabilities
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Natural language processing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Context-aware responses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Lead qualification logic
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Booking intent detection
                </li>
              </ul>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-wide mb-3">
                Deployment
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Render.com cloud hosting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Auto-scaling infrastructure
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  99.9% uptime SLA
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  SSL/TLS encryption
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 font-mono">
              © 2025 Primus Insights Roofing. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-600 font-mono">VERSION 1.0</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-400 font-mono">SYSTEM ACTIVE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

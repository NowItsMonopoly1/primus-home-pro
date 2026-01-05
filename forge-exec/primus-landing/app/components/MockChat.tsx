"use client";

import { MessageSquare, Bot } from "lucide-react";

export default function MockChat() {
  return (
    <div className="border border-emerald-500/30 bg-slate-900/60 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Bot className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            Primus AI Agent
          </h4>
          <p className="text-xs text-emerald-400 font-mono">ACTIVE</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* User Message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="bg-slate-800 rounded-lg rounded-tl-none p-3">
              <p className="text-sm text-slate-300">
                I need a roof inspection. We had storm damage last night.
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              HOMEOWNER • 2:34 PM
            </p>
          </div>
        </div>

        {/* AI Response 1 */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-lg rounded-tl-none p-3">
              <p className="text-sm text-slate-200">
                Thanks for reaching out. I understand you need an inspection for storm damage.
                To help you quickly, what's your property address?
              </p>
            </div>
            <p className="text-xs text-emerald-400 mt-1 font-mono">
              PRIMUS AI • 2:34 PM
            </p>
          </div>
        </div>

        {/* User Message 2 */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="bg-slate-800 rounded-lg rounded-tl-none p-3">
              <p className="text-sm text-slate-300">
                123 Oak Street, Los Angeles
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              HOMEOWNER • 2:35 PM
            </p>
          </div>
        </div>

        {/* AI Response 2 */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-lg rounded-tl-none p-3">
              <p className="text-sm text-slate-200">
                Perfect. What's your availability for an inspection? We can typically
                schedule within 24-48 hours.
              </p>
            </div>
            <p className="text-xs text-emerald-400 mt-1 font-mono">
              PRIMUS AI • 2:35 PM
            </p>
          </div>
        </div>

        {/* User Message 3 */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1">
            <div className="bg-slate-800 rounded-lg rounded-tl-none p-3">
              <p className="text-sm text-slate-300">
                Tomorrow afternoon works, around 2pm
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              HOMEOWNER • 2:36 PM
            </p>
          </div>
        </div>

        {/* AI Booking Confirmation */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/50 rounded-lg rounded-tl-none p-3">
              <p className="text-sm text-emerald-300 font-semibold mb-1">
                ✓ Appointment Confirmed
              </p>
              <p className="text-sm text-slate-200">
                Inspection scheduled for tomorrow at 2:00 PM. You'll receive a confirmation
                SMS with the specialist's details shortly.
              </p>
            </div>
            <p className="text-xs text-emerald-400 mt-1 font-mono">
              PRIMUS AI • 2:36 PM • BOOKING_ID: #0247
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-mono">
            CONVERSATION STATUS
          </p>
          <p className="text-xs text-emerald-400 font-mono">
            BOOKED • 142s
          </p>
        </div>
      </div>
    </div>
  );
}

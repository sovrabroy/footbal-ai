import React from 'react';
import { Activity, ShieldAlert, Sparkles, Database, ExternalLink } from 'lucide-react';
import { PREDICTION_DISCLAIMER, MODEL_VERSION } from '@/lib/predictionConfig';

interface FooterProps {
  onNavigateTab: (tab: 'home' | 'matches' | 'predictions' | 'leagues' | 'statistics' | 'about') => void;
}

export function Footer({ onNavigateTab }: FooterProps) {
  return (
    <footer id="main-footer" className="w-full border-t border-slate-800 bg-[#070A12] text-slate-400 mt-20">
      {/* Mandatory Disclaimer Box */}
      <div className="border-b border-slate-800/80 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3 text-xs leading-relaxed text-slate-400">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Statistical Disclaimer: </span>
              {PREDICTION_DISCLAIMER}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7E3AF2] to-cyan-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0A0E1A] rounded-[6px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                GoalPredict <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Empowering sports enthusiasts and analysts with transparent, baseline Poisson distributions and form-weighted football analytics.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono pt-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Model: {MODEL_VERSION}</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('home')}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('matches')}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  Live & Upcoming Matches
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('predictions')}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  Full AI Predictions Matrix
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('leagues')}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  Leagues & Standings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('statistics')}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  Accuracy & Analytics Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Methodology */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Methodology</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  How The Model Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Poisson Goal Probability
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Form & Venue Weights (25%/20%)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Verification Methodology
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & API Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with decoupled service layers ready to swap between demo dataset and live external REST endpoints (API-Football, Football-Data.org).
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <Database className="w-3 h-3 text-cyan-400" />
                REST API Ready
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GoalPredict AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Responsible Analytics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

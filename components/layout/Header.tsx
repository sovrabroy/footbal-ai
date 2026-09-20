'use client';

import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  TrendingUp,
  Trophy,
  BarChart3,
  Info,
  ShieldCheck,
  Menu,
  X,
  Radio,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActiveTab = 'home' | 'matches' | 'predictions' | 'leagues' | 'statistics' | 'about' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  fixturesSource?: 'api-football' | 'baseline';
  isLoadingFixtures?: boolean;
  onRefreshFixtures?: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  isAdmin,
  onOpenAdminLogin,
  fixturesSource = 'baseline',
  isLoadingFixtures = false,
  onRefreshFixtures,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'leagues', label: 'Leagues', icon: Trophy },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-[#0A0E1A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7E3AF2] via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-900/30 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0A0E1A] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  GoalPredict <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800/60 rounded">
                  v2.4
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium tracking-wide">
                Data-driven football predictions
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all',
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-purple-400' : 'text-slate-400')} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Live Indicator Pill & API Status */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-[11px] text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-emerald-400">
                {fixturesSource === 'api-football' ? 'API-Football Live' : 'Engine Active'}
              </span>
              {onRefreshFixtures && (
                <button
                  type="button"
                  onClick={onRefreshFixtures}
                  disabled={isLoadingFixtures}
                  title="Refresh live fixtures from API-Football"
                  className="ml-1 text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-3 h-3", isLoadingFixtures && "animate-spin text-emerald-400")} />
                </button>
              )}
            </div>

            {/* Admin Access Button */}
            {isAdmin ? (
              <button
                id="btn-admin-tab"
                onClick={() => handleNavClick('admin')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  activeTab === 'admin'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-xs'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/50'
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Admin Panel
              </button>
            ) : (
              <button
                id="btn-open-admin-login"
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
                title="Open Admin Controls"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#0F172A] px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-purple-400' : 'text-slate-400')} />
                {item.label}
              </button>
            );
          })}
          {isAdmin ? (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-800/50"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Admin Dashboard
            </button>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </div>
      )}
    </header>
  );
}

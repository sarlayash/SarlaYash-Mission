import React, { useState } from 'react';
import { 
  Infinity as InfinityIcon, 
  Sparkles, 
  Bot, 
  CheckCircle, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Menu, 
  X, 
  BookOpen, 
  Award, 
  Bell,
  FileCheck
} from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentUser: User | null;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenLogin: (isAdmin?: boolean) => void;
  onLogout: () => void;
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  onOpenLogin,
  onLogout,
  unreadNotificationsCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Explore Tracks', route: '/tracks' },
    { label: 'How It Works', route: '/how-it-works' },
    { label: 'Generative AI', route: '/tracks/generative-ai' },
    { label: 'Agentic AI', route: '/tracks/agentic-ai' },
    { label: 'FAQ', route: '/faq' },
    { label: 'Verify Credential', route: '/verify' }
  ];

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Mission Identity */}
          <div 
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <InfinityIcon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  ZERO-TO-INFINITY
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  30-DAY MISSION
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">
                SarlaYash Mission · <span className="text-slate-300">Powered by Kapil</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentUser?.role === 'admin' ? (
              <>
                <button
                  onClick={() => handleNav('/admin')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute.startsWith('/admin') ? 'text-cyan-400 bg-slate-900 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  Admin Portal
                </button>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/50 transition-colors"
                >
                  Learner View
                </button>
              </>
            ) : currentUser?.role === 'learner' ? (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute === '/dashboard' ? 'text-cyan-400 bg-slate-900 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => handleNav('/assignments')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute === '/assignments' ? 'text-cyan-400 bg-slate-900 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  Assignments
                </button>
                <button
                  onClick={() => handleNav('/progress')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute === '/progress' ? 'text-cyan-400 bg-slate-900 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  30-Day Timeline
                </button>
                <button
                  onClick={() => handleNav('/credentials')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute === '/credentials' ? 'text-cyan-400 bg-slate-900 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  Credentials & Badges
                </button>
              </>
            ) : (
              navItems.map((item) => (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentRoute === item.route ? 'text-cyan-400 bg-slate-900 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  {item.label}
                </button>
              ))
            )}
          </nav>

          {/* Action buttons & User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 relative">
                {currentUser.role === 'learner' && (
                  <button
                    onClick={() => handleNav('/notifications')}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg relative transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-slate-950" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
                >
                  <img
                    src={currentUser.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.display_name}`}
                    alt={currentUser.display_name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/50"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block truncate max-w-[120px]">
                      {currentUser.display_name}
                    </span>
                    <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider">
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-800 text-xs">
                      <p className="font-medium text-slate-200 truncate">{currentUser.display_name}</p>
                      <p className="text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.role === 'admin' ? (
                      <>
                        <button
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-cyan-400" />
                          Admin Console
                        </button>
                        <button
                          onClick={() => handleNav('/dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          Learner Dashboard
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNav('/dashboard')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          Learning Dashboard
                        </button>
                        <button
                          onClick={() => handleNav('/profile')}
                          className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Profile & Settings
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLogin(true)}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>
                <button
                  onClick={() => onOpenLogin(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser && (
              <button
                onClick={() => handleNav('/dashboard')}
                className="p-1.5 rounded-lg bg-slate-900 text-xs text-cyan-400 border border-slate-800"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {currentUser?.role === 'admin' ? (
              <>
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-cyan-400 font-medium hover:bg-slate-900"
                >
                  Admin Portal
                </button>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 font-medium hover:bg-slate-900"
                >
                  Learner Dashboard
                </button>
              </>
            ) : currentUser?.role === 'learner' ? (
              <>
                <button
                  onClick={() => handleNav('/dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-cyan-400 font-medium hover:bg-slate-900"
                >
                  My Dashboard
                </button>
                <button
                  onClick={() => handleNav('/assignments')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 font-medium hover:bg-slate-900"
                >
                  Assignments
                </button>
                <button
                  onClick={() => handleNav('/progress')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 font-medium hover:bg-slate-900"
                >
                  30-Day Timeline
                </button>
                <button
                  onClick={() => handleNav('/credentials')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 font-medium hover:bg-slate-900"
                >
                  Credentials & Badges
                </button>
              </>
            ) : (
              navItems.map(item => (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 font-medium hover:bg-slate-900"
                >
                  {item.label}
                </button>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">{currentUser.display_name}</p>
                  <p className="text-slate-400 text-[11px]">{currentUser.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg text-xs text-rose-400 bg-rose-950/30 border border-rose-900/40"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin(false);
                  }}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-center flex items-center justify-center gap-2"
                >
                  Sign In with Google
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin(true);
                  }}
                  className="w-full py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 text-center"
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

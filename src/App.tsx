import React, { useState } from 'react';
import { Shield, Search, Lock, UserCheck, AlertTriangle, Globe } from 'lucide-react';

// Translations Object for English and Roman Urdu
const translations = {
  en: {
    title: "Security Portal",
    nav: {
      dashboard: "Dashboard",
      logs: "Audit Logs",
      settings: "Settings"
    },
    dashboard: {
      sessions: "Authenticated Sessions",
      resources: "Protected Resources",
      alerts: "Security Alerts"
    },
    logs: {
      title: "System Audit Logs",
      searchPlaceholder: "Search logs...",
      noFlags: "No recent activity flags detected."
    },
    settings: {
      title: "Security Preferences",
      description: "Configure authentication thresholds and monitoring rules.",
      languageLabel: "Select Language"
    }
  },
  ur_roman: {
    title: "Security Portal",
    nav: {
      dashboard: "Dashboard",
      logs: "Audit Logs",
      settings: "Settings"
    },
    dashboard: {
      sessions: "Authenticated Sessions",
      resources: "Protected Resources",
      alerts: "Security Alerts"
    },
    logs: {
      title: "System Audit Logs",
      searchPlaceholder: "Logs talash karein...",
      noFlags: "Koi haal hi ki mashkook activity nahi mili."
    },
    settings: {
      title: "Security Settings",
      description: "Authentication ki hudood aur monitoring ke qawaneen set karein.",
      languageLabel: "Zuban Muntakhib Karein"
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'settings'>('dashboard');
  const [lang, setLang] = useState<'en' | 'ur_roman'>('en');

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-indigo-500" />
          <span className="text-xl font-bold tracking-tight">{t.title}</span>
        </div>

        <div className="flex items-center space-x-6">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.nav.dashboard}
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.nav.logs}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.nav.settings}
            </button>
          </nav>

          {/* Language Switcher Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5">
            <Globe className="h-4 w-4 text-slate-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'ur_roman')}
              className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-slate-200">English</option>
              <option value="ur_roman" className="bg-slate-900 text-slate-200">Roman Urdu</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center space-x-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{t.dashboard.sessions}</p>
                <h3 className="text-2xl font-semibold">1,284</h3>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{t.dashboard.resources}</p>
                <h3 className="text-2xl font-semibold">42</h3>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center space-x-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{t.dashboard.alerts}</p>
                <h3 className="text-2xl font-semibold">3</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t.logs.title}</h2>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder={t.logs.searchPlaceholder}
                  className="bg-slate-900 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm">{t.logs.noFlags}</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">{t.settings.title}</h2>
            <p className="text-slate-400 text-sm mb-6">{t.settings.description}</p>
            
            <div className="border-t border-slate-700/50 pt-4 max-w-xs">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t.settings.languageLabel}
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as 'en' | 'ur_roman')}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="en">English</option>
                <option value="ur_roman">Roman Urdu</option>
              </select>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
// src/pages/GuidelinesPage.jsx — Step 8.4–8.6: Comprehensive waste guidelines with 8 tabs + Malaysia bins

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WASTE_RULES, MALAYSIA_BINS } from '../config/wasteRules';
import useDarkMode from '../hooks/useDarkMode';

/* ── Country recycling rules from Rules.md ── */
const COUNTRY_RULES = {
  malaysia: {
    flag: '🇲🇾',
    name: 'Malaysia (Johor Bahru)',
    rules: [
      'Source separation mandatory',
      'Rinse recyclables clean (no food residue)',
      'Flatten cardboard, crush cans',
      'Textiles → donation centers (not blue bin)',
      'Tyres → special disposal centers only',
    ],
  },
  japan: {
    flag: '🇯🇵',
    name: 'Japan',
    bins: '🔥 Burnable · ❄️ Non-burnable · ♻️ PET bottles / Cans / Paper · 🛍️ Plastic packaging · 🏠 Bulky waste',
    rules: [
      'Strict sorting + collection days',
      '11+ waste categories',
      'Fines for contamination',
      'Plastic packaging separated from PET',
    ],
  },
  korea: {
    flag: '🇰🇷',
    name: 'South Korea',
    bins: '🟨 General waste · 🥬 Food waste · ♻️ Recyclables · 📦 Bulky items',
    rules: [
      'Mandatory paid waste bags',
      'Food waste separation enforced',
      'Sticker required for bulky items',
      'Sorted recycling (plastics/paper)',
    ],
  },
  usa: {
    flag: '🇺🇸',
    name: 'USA (San Francisco)',
    bins: '🟦 Blue: Mixed recyclables · 🟢 Green: Compost · ⚫ Black: Landfill',
    rules: [
      'Rules vary by city',
      'Some mandatory composting',
      'Mixed recyclables in one bin',
      'No plastic bags in recycling',
    ],
  },
  uk: {
    flag: '🇬🇧',
    name: 'United Kingdom',
    bins: '🟦 Paper · 🟢 Glass · 🟡 Plastics/metals · 🟤 Food waste · ⚫ General',
    rules: [
      'Clean + dry mandatory',
      'Food waste collection expanding',
      '5 main bin types',
      'Council-specific variations',
    ],
  },
  netherlands: {
    flag: '🇳🇱',
    name: 'Netherlands',
    bins: '🟠 PMD (plastic/metal/drink cartons) · 🟢 Organic · 🔵 Paper · ⚫ Residual',
    rules: [
      'Fines for incorrect sorting',
      'Underground bins common',
      'PMD = plastic + metal + drink cartons',
      'Organic/food waste separated',
    ],
  },
};

/* ── Global rules from Rules.md ── */
const GLOBAL_RULES = {
  dos: [
    'Separate by material type (plastic/paper/glass/metal)',
    'Rinse food residue OFF recyclables',
    'Flatten cardboard, crush cans',
    'Follow collection day schedule',
    'Use special bins for textiles/electronics',
  ],
  donts: [
    'Put dirty items in recycling',
    'Bag recyclables in plastic bags',
    'Mix hazardous waste (batteries/paint)',
    'Ignore local sorting rules',
  ],
};

const WASTE_TABS = Object.keys(WASTE_RULES);

export default function GuidelinesPage() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [activeTab, setActiveTab] = useState(WASTE_TABS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountrySection, setShowCountrySection] = useState(false);

  const activeRule = WASTE_RULES[activeTab];

  // 8.5 Search filter
  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return WASTE_TABS;
    const q = searchQuery.toLowerCase();
    return WASTE_TABS.filter(key => {
      const rule = WASTE_RULES[key];
      return (
        rule.displayName.toLowerCase().includes(q) ||
        rule.category.toLowerCase().includes(q) ||
        rule.examples.toLowerCase().includes(q) ||
        rule.shortRules.some(r => r.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/10 to-blue-600/10 dark:from-blue-400/20 dark:to-blue-600/20 flex items-center justify-center text-blue-500 dark:text-blue-400 border border-blue-400/20 shadow-inner">
          <span className="material-icons-round text-3xl">menu_book</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
            Waste Guidelines
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">
            Learn how to sort and recycle properly
          </p>
        </div>
      </div>

      {/* ── Search Bar (8.5) ── */}
      <div className="relative mb-6">
        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-200/40 text-xl">search</span>
        <input
          type="text"
          placeholder="Search waste types, rules, examples..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-emerald-900/10 dark:border-white/10 rounded-2xl text-emerald-950 dark:text-white placeholder:text-emerald-800/30 dark:placeholder:text-emerald-200/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-300"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-200/40 hover:text-emerald-950 dark:hover:text-white transition-colors cursor-pointer">
            <span className="material-icons-round text-lg">close</span>
          </button>
        )}
      </div>

      {/* ── 8.4 Waste Type Tabs (8 tabs) ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {filteredTabs.map(key => {
          const rule = WASTE_RULES[key];
          const isActive = activeTab === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(key)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all duration-300 ${isActive
                ? 'shadow-md'
                : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
              style={isActive ? {
                backgroundColor: `${rule.color}15`,
                color: rule.color,
                borderColor: `${rule.color}40`,
              } : {}}
            >
              <span className="text-base">{rule.icon}</span>
              <span className="hidden sm:inline">{rule.displayName}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Active Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Hero Card */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500 relative overflow-hidden">
            {/* Color accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2.5rem]" style={{ backgroundColor: activeRule.color }} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl border shadow-inner flex-shrink-0"
                style={{ backgroundColor: `${activeRule.color}12`, borderColor: `${activeRule.color}25` }}
              >
                {activeRule.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-3xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
                    {activeRule.displayName}
                  </h2>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                    style={{ color: activeRule.color, borderColor: `${activeRule.color}40`, backgroundColor: `${activeRule.color}12` }}
                  >
                    {activeRule.category}
                  </span>
                </div>
                <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium text-sm transition-colors duration-500">
                  {activeRule.examples}
                </p>
              </div>
            </div>

            {/* Correct Bin */}
            <div className="mb-8 p-5 rounded-2xl border border-emerald-900/5 dark:border-white/5 bg-white/40 dark:bg-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-3">Correct Disposal Bin</p>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border shadow-inner"
                  style={{ backgroundColor: `${activeRule.correctBin.color}20`, borderColor: `${activeRule.correctBin.color}35` }}
                >
                  {activeRule.correctBin.symbol}
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-950 dark:text-white transition-colors duration-500">{activeRule.correctBin.name}</p>
                  <p className="text-xs text-emerald-800/50 dark:text-emerald-200/40 font-medium capitalize">
                    Disposal method: {activeRule.disposalMethod}
                  </p>
                </div>
              </div>
            </div>

            {/* Short Rules */}
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-4">Key Rules</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRule.shortRules.map((rule, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5"
                  >
                    <span className="material-icons-round text-base mt-0.5 flex-shrink-0" style={{ color: activeRule.color }}>check_circle</span>
                    <span className="text-sm font-medium text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">{rule}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Preparation Checklist */}
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 dark:text-emerald-200/30 mb-4">Preparation Checklist</p>
              <div className="space-y-2">
                {activeRule.checklist.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black border border-emerald-900/10 dark:border-white/10 text-emerald-800/40 dark:text-emerald-200/30">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-emerald-900/70 dark:text-emerald-100/70">
                      {item.step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Action */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/dashboard/scanner')}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-emerald-500 text-emerald-950 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-icons-round text-lg">qr_code_scanner</span>
              Scan {activeRule.displayName} Now
            </motion.button>
          </div>

          {/* ── Malaysia Bins Section ── */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🇲🇾</span>
              <div>
                <h3 className="text-xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">Malaysia Bin Colors</h3>
                <p className="text-emerald-800/50 dark:text-emerald-200/40 text-xs font-medium">Johor Bahru — Source separation mandatory</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(MALAYSIA_BINS).map(([key, bin]) => (
                <div
                  key={key}
                  className="flex items-center gap-4 p-4 rounded-2xl border transition-colors duration-300"
                  style={{
                    backgroundColor: `${bin.color}08`,
                    borderColor: `${bin.color}20`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border shadow-inner flex-shrink-0"
                    style={{ backgroundColor: `${bin.color}20`, borderColor: `${bin.color}35` }}
                  >
                    {bin.symbol}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-emerald-950 dark:text-white transition-colors duration-500">{bin.name}</p>
                    <p className="text-xs text-emerald-800/50 dark:text-emerald-200/40 font-medium truncate">{bin.accepts}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Malaysia-specific rules */}
            <div className="mt-5 space-y-2">
              {COUNTRY_RULES.malaysia.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-emerald-900/5 dark:border-white/5">
                  <span className="material-icons-round text-sm mt-0.5 text-primary">eco</span>
                  <span className="text-xs font-medium text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Global Universal Rules ── */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌍</span>
              <div>
                <h3 className="text-xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">Global Universal Rules</h3>
                <p className="text-emerald-800/50 dark:text-emerald-200/40 text-xs font-medium">Proper sorting increases recycling rates by 70%+</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Do's */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-1">
                  <span className="material-icons-round text-xs">check_circle</span> Always Do
                </p>
                <div className="space-y-2">
                  {GLOBAL_RULES.dos.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/15">
                      <span className="text-xs font-black text-primary mt-0.5">{i + 1}</span>
                      <span className="text-xs font-medium text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Don'ts */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-1">
                  <span className="material-icons-round text-xs">cancel</span> Never Do
                </p>
                <div className="space-y-2">
                  {GLOBAL_RULES.donts.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/15">
                      <span className="text-xs font-black text-red-500 mt-0.5">{i + 1}</span>
                      <span className="text-xs font-medium text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Country-Specific Rules (collapsible) ── */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/50 transition-colors duration-500">
            <motion.button
              onClick={() => setShowCountrySection(!showCountrySection)}
              className="w-full p-8 sm:p-10 flex items-center justify-between cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🗺️</span>
                <div className="text-left">
                  <h3 className="text-xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">Country-Specific Rules</h3>
                  <p className="text-emerald-800/50 dark:text-emerald-200/40 text-xs font-medium">Japan, Korea, USA, UK, Netherlands</p>
                </div>
              </div>
              <motion.span
                animate={{ rotate: showCountrySection ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="material-icons-round text-emerald-800/30 dark:text-emerald-200/30 text-2xl"
              >
                expand_more
              </motion.span>
            </motion.button>

            <AnimatePresence initial={false}>
              {showCountrySection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-8 sm:px-10 pb-10 space-y-4 border-t border-emerald-900/5 dark:border-white/5 pt-6">
                    {Object.entries(COUNTRY_RULES).filter(([k]) => k !== 'malaysia').map(([key, country]) => (
                      <div
                        key={key}
                        className="p-5 rounded-2xl border border-emerald-900/5 dark:border-white/5 bg-white/40 dark:bg-white/5"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{country.flag}</span>
                          <h4 className="font-bold text-base text-emerald-950 dark:text-white transition-colors duration-500">{country.name}</h4>
                        </div>
                        {country.bins && (
                          <p className="text-xs text-emerald-800/60 dark:text-emerald-200/40 font-medium mb-3 leading-relaxed">{country.bins}</p>
                        )}
                        <div className="space-y-1.5">
                          {country.rules.map((rule, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-emerald-900/70 dark:text-emerald-100/60 font-medium">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

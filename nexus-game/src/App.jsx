import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  History,
  Settings,
  Moon,
  Coffee,
  GraduationCap,
  Sparkles,
  Cake,
  Coins,
  Heart,
  Zap,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  SunMedium,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  UserCheck
} from 'lucide-react';

import { INITIAL_GAME_STATE, RANDOM_EVENTS, LIFE_STAGE_DETAILS } from './constants/gameData';
import { playSound } from './utils/audio';

import { Avatar } from './components/Avatar';
import { StatCard } from './components/StatCard';
import { DoughnutChart } from './components/DoughnutChart';
import { HistoryChart } from './components/HistoryChart';
import { ActivityFeed } from './components/ActivityFeed';
import { ShopView } from './components/ShopView';
import { InventoryView } from './components/InventoryView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MonthlyAllowanceModal } from './components/MonthlyAllowanceModal';
import { BirthdayModal } from './components/BirthdayModal';
import { NewGameModal } from './components/NewGameModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';

const STORAGE_KEY = 'nexus_life_game_state_v1';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return INITIAL_GAME_STATE;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'shop' | 'inventory' | 'history'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals & Popups
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);
  const [birthdayTransitionInfo, setBirthdayTransitionInfo] = useState({ oldStage: '', newStage: '', age: 0 });
  const [newGameModalOpen, setNewGameModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Recent stat deltas for visual badges on cards
  const [statDeltas, setStatDeltas] = useState({
    money: null,
    happiness: null,
    energy: null,
    attendance: null
  });

  // Auto-save game state to localStorage
  useEffect(() => {
    try {
      if (gameState.name) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      }
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [gameState]);

  // Toast helper
  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Flash stat deltas on cards
  const flashDeltas = (deltas) => {
    setStatDeltas(deltas);
    setTimeout(() => {
      setStatDeltas({ money: null, happiness: null, energy: null, attendance: null });
    }, 3000);
  };

  // Sound effect helper
  const triggerAudio = useCallback((type) => {
    playSound(type, gameState.soundEnabled);
  }, [gameState.soundEnabled]);

  // --- CHARACTER CREATION ---
  const handleStartGame = ({ name, age, lifeStage }) => {
    const initialState = {
      ...INITIAL_GAME_STATE,
      name,
      age,
      lifeStage,
      history: [
        {
          id: 'init-1',
          day: 1,
          action: 'Character Created',
          details: `${name} began the NEXUS journey as a ${lifeStage}. Initial funds: ₹10,000.`,
          moneyChange: 10000,
          happinessChange: 70,
          energyChange: 80,
          attendanceChange: 85,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };
    setGameState(initialState);
    triggerAudio('success');
    addToast(`Welcome to NEXUS, ${name}! Your student life begins now.`, 'success', 'Journey Started');
  };

  // --- HELPER TO RECORD ACTION HISTORY ---
  const recordAction = (action, details, deltas, nextState) => {
    const newEntry = {
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      day: nextState.day,
      action,
      details,
      moneyChange: deltas.money || 0,
      happinessChange: deltas.happiness || 0,
      energyChange: deltas.energy || 0,
      attendanceChange: deltas.attendance || 0,
      resultingStats: {
        money: nextState.money,
        happiness: nextState.happiness,
        energy: nextState.energy,
        attendance: nextState.attendance
      },
      timestamp: new Date().toLocaleTimeString()
    };

    return [newEntry, ...(nextState.history || [])];
  };

  // --- ACTIONS ---

  // Sleep: Energy +80 (cap 100), Happiness +5 (cap 100)
  const handleSleep = () => {
    const energyAdd = Math.min(100 - gameState.energy, 80);
    const happinessAdd = Math.min(100 - gameState.happiness, 5);

    const newEnergy = Math.min(100, gameState.energy + 80);
    const newHappiness = Math.min(100, gameState.happiness + 5);

    const deltas = { energy: energyAdd, happiness: happinessAdd };
    flashDeltas(deltas);

    setGameState((prev) => {
      const updated = {
        ...prev,
        energy: newEnergy,
        happiness: newHappiness
      };
      updated.history = recordAction(
        'Deep Sleep',
        `Recharged physical stamina (+${energyAdd} Energy) and woke up refreshed (+${happinessAdd} Happiness).`,
        deltas,
        updated
      );
      return updated;
    });

    triggerAudio('sleep');
    addToast(`You had a deep, restful sleep! (+${energyAdd} Energy, +${happinessAdd} Happiness)`, 'success', 'Sleep Complete');
  };

  // Rest: Energy +30 (cap 100), Happiness +3 (cap 100)
  const handleRest = () => {
    const energyAdd = Math.min(100 - gameState.energy, 30);
    const happinessAdd = Math.min(100 - gameState.happiness, 3);

    const newEnergy = Math.min(100, gameState.energy + 30);
    const newHappiness = Math.min(100, gameState.happiness + 3);

    const deltas = { energy: energyAdd, happiness: happinessAdd };
    flashDeltas(deltas);

    setGameState((prev) => {
      const updated = {
        ...prev,
        energy: newEnergy,
        happiness: newHappiness
      };
      updated.history = recordAction(
        'Power Nap / Rest',
        `Relaxed on the dorm couch (+${energyAdd} Energy, +${happinessAdd} Happiness).`,
        deltas,
        updated
      );
      return updated;
    });

    triggerAudio('rest');
    addToast(`Quick power nap taken! (+${energyAdd} Energy, +${happinessAdd} Happiness)`, 'info', 'Rest Complete');
  };

  // Attend Class:
  // If energy < 10: reject with tiredness message and do not change any stats.
  // Otherwise energy -15, happiness -2, attendance +2 (capped at 100).
  const handleAttendClass = () => {
    if (gameState.energy < 10) {
      triggerAudio('error');
      addToast(
        'Too exhausted to attend lecture! You need at least 10 Energy. Take a rest or sleep first.',
        'error',
        'Class Attendance Rejected'
      );
      return;
    }

    const newEnergy = Math.max(0, gameState.energy - 15);
    const newHappiness = Math.max(0, gameState.happiness - 2);
    const newAttendance = Math.min(100, gameState.attendance + 2);

    const deltas = { energy: -15, happiness: -2, attendance: +2 };
    flashDeltas(deltas);

    setGameState((prev) => {
      const updated = {
        ...prev,
        energy: newEnergy,
        happiness: newHappiness,
        attendance: newAttendance
      };
      updated.history = recordAction(
        'Attended Class',
        `Attended academic lecture. Attendance rose to ${newAttendance}% (-15 Energy, -2 Happiness).`,
        deltas,
        updated
      );
      return updated;
    });

    triggerAudio('success');
    addToast(
      `Attended lecture! Attendance increased to ${newAttendance}% (-15 Energy, -2 Happiness)`,
      'success',
      'Lecture Attended'
    );
  };

  // Skip Class: Energy +10 (cap 100), Happiness +3 (cap 100), Attendance -3 (min 0)
  const handleSkipClass = () => {
    const newEnergy = Math.min(100, gameState.energy + 10);
    const newHappiness = Math.min(100, gameState.happiness + 3);
    const newAttendance = Math.max(0, gameState.attendance - 3);

    const deltas = { energy: 10, happiness: 3, attendance: -3 };
    flashDeltas(deltas);

    setGameState((prev) => {
      const updated = {
        ...prev,
        energy: newEnergy,
        happiness: newHappiness,
        attendance: newAttendance
      };
      updated.history = recordAction(
        'Skipped Class',
        `Bunked lecture to relax (+10 Energy, +3 Happiness, -3 Attendance).`,
        deltas,
        updated
      );
      return updated;
    });

    triggerAudio('rest');
    addToast(
      `Skipped class to chill! Attendance dropped to ${newAttendance}% (+10 Energy, +3 Happiness)`,
      'warning',
      'Class Skipped'
    );
  };

  // Trigger Random Event (Uniform choice among 5)
  const triggerRandomEventInternal = (currentState) => {
    const randomIndex = Math.floor(Math.random() * RANDOM_EVENTS.length);
    const event = RANDOM_EVENTS[randomIndex];

    const result = event.apply(currentState);
    const deltas = result.delta || {};

    const nextState = {
      ...currentState,
      ...(result.money !== undefined && { money: result.money }),
      ...(result.happiness !== undefined && { happiness: result.happiness }),
      ...(result.energy !== undefined && { energy: result.energy })
    };

    nextState.history = recordAction(
      `Event: ${event.title}`,
      event.description,
      deltas,
      nextState
    );

    return { nextState, event, deltas };
  };

  // Explicit button for triggering random event
  const handleTriggerRandomEvent = () => {
    const { nextState, event, deltas } = triggerRandomEventInternal(gameState);
    setGameState(nextState);
    flashDeltas(deltas);

    if (event.type === 'positive') {
      triggerAudio('buy');
      addToast(event.description, 'success', event.title);
    } else if (event.type === 'negative') {
      triggerAudio('error');
      addToast(event.description, 'error', event.title);
    } else {
      triggerAudio('rest');
      addToast(event.description, 'info', event.title);
    }
  };

  // End Day:
  // Increment day by 1. Energy -20 and happiness -5.
  // Show new-day notification.
  // Trigger monthly check (day % 30 === 1, first at day 31) and one random event.
  const handleEndDay = () => {
    const nextDay = gameState.day + 1;
    const newEnergy = Math.max(0, gameState.energy - 20);
    const newHappiness = Math.max(0, gameState.happiness - 5);

    let intermediateState = {
      ...gameState,
      day: nextDay,
      energy: newEnergy,
      happiness: newHappiness
    };

    intermediateState.history = recordAction(
      `Day ${nextDay} Began`,
      `Completed Day ${gameState.day}. Night passed (-20 Energy, -5 Happiness).`,
      { energy: -20, happiness: -5 },
      intermediateState
    );

    // Apply 1 random event
    const { nextState: finalState, event, deltas } = triggerRandomEventInternal(intermediateState);

    setGameState(finalState);
    flashDeltas({ energy: -20 + (deltas.energy || 0), happiness: -5 + (deltas.happiness || 0), money: deltas.money || null });
    triggerAudio('day_end');

    addToast(
      `Day ${nextDay} has dawned! Event: "${event.title}"`,
      'info',
      `Day ${nextDay} Started`
    );

    // Check monthly allowance: day % 30 === 1 (first at 31)
    if (nextDay % 30 === 1) {
      setTimeout(() => {
        setAllowanceModalOpen(true);
      }, 700);
    }
  };

  // Monthly allowance handlers
  const handleAcceptAllowance = () => {
    setAllowanceModalOpen(false);
    const nextMoney = gameState.money + 10000;
    flashDeltas({ money: 10000 });

    setGameState((prev) => {
      const updated = {
        ...prev,
        money: nextMoney
      };
      updated.history = recordAction(
        'Parental Allowance',
        'Accepted ₹10,000 monthly college maintenance allowance from parents.',
        { money: 10000 },
        updated
      );
      return updated;
    });

    triggerAudio('buy');
    addToast('Accepted ₹10,000 monthly allowance from parents!', 'success', 'Allowance Received');
  };

  const handleDeclineAllowance = () => {
    setAllowanceModalOpen(false);
    const newHappiness = Math.min(100, gameState.happiness + 5);
    flashDeltas({ happiness: 5 });

    setGameState((prev) => {
      const updated = {
        ...prev,
        happiness: newHappiness
      };
      updated.history = recordAction(
        'Declined Allowance',
        'Declined monthly allowance to pursue independent college life (+5 Happiness pride bonus).',
        { happiness: 5 },
        updated
      );
      return updated;
    });

    triggerAudio('success');
    addToast('Declined allowance! Proud of your self-reliance (+5 Happiness)', 'info', 'Self-Reliance');
  };

  // Birthday:
  // Increment age by 1. Happiness +10 (cap 100).
  // If age >= 60, life stage becomes RETIRED; otherwise if age >= 22, life stage becomes WORKING; else if age >= 18, STUDENT; else CHILD.
  const handleBirthday = () => {
    const newAge = gameState.age + 1;
    const oldStage = gameState.lifeStage;
    let newStage = oldStage;

    if (newAge >= 60) {
      newStage = 'RETIRED';
    } else if (newAge >= 22) {
      newStage = 'WORKING';
    } else if (newAge >= 18) {
      newStage = 'STUDENT';
    } else {
      newStage = 'CHILD';
    }

    const happinessAdd = Math.min(100 - gameState.happiness, 10);
    const newHappiness = Math.min(100, gameState.happiness + 10);

    const deltas = { happiness: happinessAdd };
    flashDeltas(deltas);

    setBirthdayTransitionInfo({ oldStage, newStage, age: newAge });
    setBirthdayModalOpen(true);

    setGameState((prev) => {
      const updated = {
        ...prev,
        age: newAge,
        lifeStage: newStage,
        happiness: newHappiness
      };
      updated.history = recordAction(
        `Birthday: Turned ${newAge}!`,
        `Celebrated birthday! Age became ${newAge}. Life Stage: ${newStage} (+${happinessAdd} Happiness).`,
        deltas,
        updated
      );
      return updated;
    });

    triggerAudio('birthday');
    addToast(`Happy Birthday! You turned ${newAge}! (+10 Happiness)`, 'success', 'Birthday Celebration');
  };

  // Buy Shop Item
  const handleBuyItem = (item) => {
    if (gameState.money < item.price) {
      triggerAudio('error');
      addToast(
        `Cannot afford ${item.name}! You need ₹${item.price}, but only have ₹${gameState.money}.`,
        'error',
        'Insufficient Balance'
      );
      return;
    }

    const newMoney = gameState.money - item.price;
    const newHappiness = Math.min(100, Math.max(0, gameState.happiness + item.happiness));
    const newEnergy = Math.min(100, Math.max(0, gameState.energy + item.energy));
    const newTotalSpent = gameState.totalSpent + item.price;

    const purchasedItem = {
      ...item,
      purchasedAtDay: gameState.day,
      purchasedAtTime: new Date().toLocaleTimeString(),
      uniquePurchaseId: Date.now() + Math.random().toString(36).substring(2, 6)
    };

    const deltas = {
      money: -item.price,
      happiness: item.happiness,
      energy: item.energy
    };
    flashDeltas(deltas);

    setGameState((prev) => {
      const updated = {
        ...prev,
        money: newMoney,
        happiness: newHappiness,
        energy: newEnergy,
        totalSpent: newTotalSpent,
        inventory: [...prev.inventory, purchasedItem]
      };
      updated.history = recordAction(
        `Bought ${item.name}`,
        `Purchased ${item.name} for ₹${item.price}. Applied effects: ${item.happiness >= 0 ? `+${item.happiness}` : item.happiness} Happy, ${item.energy >= 0 ? `+${item.energy}` : item.energy} Energy.`,
        deltas,
        updated
      );
      return updated;
    });

    triggerAudio('buy');
    addToast(
      `Purchased ${item.name} for ₹${item.price}! (Applied ${item.happiness >= 0 ? `+${item.happiness}` : item.happiness} Happiness, ${item.energy >= 0 ? `+${item.energy}` : item.energy} Energy)`,
      'success',
      'Item Acquired'
    );
  };

  // Reset / New Game
  const handleConfirmReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(INITIAL_GAME_STATE);
    setNewGameModalOpen(false);
    triggerAudio('rest');
    addToast('Simulation progress reset. Ready to create a new character.', 'info', 'New Game');
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !gameState.soundEnabled;
    setGameState((prev) => ({ ...prev, soundEnabled: nextState }));
    if (nextState) {
      playSound('buy', true);
    }
  };

  // If character has no name yet, render the Welcome / Character Creation screen
  if (!gameState.name) {
    return (
      <>
        <WelcomeScreen onStartGame={handleStartGame} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  const lifeStageMeta = LIFE_STAGE_DETAILS[gameState.lifeStage] || LIFE_STAGE_DETAILS.STUDENT;

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Modals */}
      <MonthlyAllowanceModal
        isOpen={allowanceModalOpen}
        day={gameState.day}
        onAccept={handleAcceptAllowance}
        onDecline={handleDeclineAllowance}
      />

      <BirthdayModal
        isOpen={birthdayModalOpen}
        newAge={birthdayTransitionInfo.age}
        newLifeStage={birthdayTransitionInfo.newStage}
        oldLifeStage={birthdayTransitionInfo.oldStage}
        onClose={() => setBirthdayModalOpen(false)}
      />

      <NewGameModal
        isOpen={newGameModalOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setNewGameModalOpen(false)}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={handleToggleSound}
        onTriggerNewGame={() => setNewGameModalOpen(true)}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="flex items-center justify-between">
            <div>
              <span className="brand-badge mb-2">
                <Sparkles size={12} /> LIFE BEYOND CODE
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white mt-1">
                NEXUS
              </h1>
            </div>
            {mobileMenuOpen && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{gameState.name}</span>
            <span className={`badge ${lifeStageMeta.badgeClass} text-[10px] py-0.5`}>
              {gameState.lifeStage}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
          >
            <LayoutDashboard className="nav-icon" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('shop');
              setMobileMenuOpen(false);
            }}
          >
            <ShoppingBag className="nav-icon" />
            <span>Campus Shop</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('inventory');
              setMobileMenuOpen(false);
            }}
          >
            <Package className="nav-icon" />
            <span>Inventory</span>
            {gameState.inventory.length > 0 && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                {gameState.inventory.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              setMobileMenuOpen(false);
            }}
          >
            <History className="nav-icon" />
            <span>Life History</span>
          </button>

          <button
            type="button"
            className="nav-item"
            onClick={() => {
              setSettingsModalOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <Settings className="nav-icon" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer Stats Preview */}
        <div className="p-4 m-3 rounded-2xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Day Progress</span>
            <span className="font-mono text-purple-300 font-bold">Day {gameState.day}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: `${Math.min(100, (gameState.day % 30) * 3.33)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Parent Allowance:</span>
            <span className="font-mono text-emerald-400">
              {30 - ((gameState.day - 1) % 30)}d away
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Simulation Portal</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-purple-300 font-mono font-bold">
                  Day {gameState.day}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{gameState.age} yrs old</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {activeTab === 'dashboard' && `Welcome back, ${gameState.name}!`}
                {activeTab === 'shop' && 'NEXUS Campus Shop'}
                {activeTab === 'inventory' && 'Possessions & Inventory'}
                {activeTab === 'history' && 'Life Logs & Trajectories'}
              </h2>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              title={gameState.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            >
              {gameState.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Birthday Button */}
            <button
              type="button"
              onClick={handleBirthday}
              className="btn btn-outline-purple text-xs py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5"
            >
              <Cake size={15} />
              <span className="hidden sm:inline">Age Up / Birthday</span>
              <span className="sm:hidden">Age+</span>
            </button>

            {/* New Game Button */}
            <button
              type="button"
              onClick={() => setNewGameModalOpen(true)}
              className="btn btn-secondary text-xs py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">New Game</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP HERO SECTION: Character Card + Stat Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Character Portrait Card (4 cols) */}
                <div className="lg:col-span-4 glass-panel p-6 flex flex-col items-center justify-between text-center border-t-4 border-purple-500">
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="badge badge-purple text-[10px]">
                      {gameState.lifeStage}
                    </span>
                    <span className="font-mono text-slate-300">
                      Day {gameState.day}
                    </span>
                  </div>

                  {/* Character Avatar */}
                  <div className="my-2">
                    <Avatar
                      happiness={gameState.happiness}
                      energy={gameState.energy}
                      lifeStage={gameState.lifeStage}
                      size={155}
                    />
                  </div>

                  {/* Character Name & Age */}
                  <div className="mt-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {gameState.name}
                    </h3>
                    <p className="text-xs text-purple-300 font-semibold mt-0.5">
                      {gameState.age} Years Old • {lifeStageMeta.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto line-clamp-2">
                      {lifeStageMeta.description}
                    </p>
                  </div>

                  {/* Action shortcut: Celebrate Birthday */}
                  <button
                    type="button"
                    onClick={handleBirthday}
                    className="btn btn-outline-purple w-full mt-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Cake size={15} /> Celebrate Birthday (+10 Happiness)
                  </button>
                </div>

                {/* 4 Primary Stat Cards (8 cols: 2x2 grid) */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Money Card */}
                  <StatCard
                    title="Liquid Money"
                    subtitle="Indian Rupees (₹)"
                    value={gameState.money}
                    formattedValue={`₹${gameState.money.toLocaleString('en-IN')}`}
                    icon={Coins}
                    accentColor="#10b981"
                    delta={statDeltas.money}
                    onClick={() => setActiveTab('shop')}
                  />

                  {/* Happiness Card */}
                  <StatCard
                    title="Happiness Level"
                    subtitle={gameState.happiness >= 70 ? 'Ecstatic & Motivated' : gameState.happiness < 40 ? 'Stressed / Depressed' : 'Normal / Neutral'}
                    value={gameState.happiness}
                    max={100}
                    unit="%"
                    icon={Heart}
                    accentColor="#ec4899"
                    delta={statDeltas.happiness}
                  />

                  {/* Energy Card */}
                  <StatCard
                    title="Energy Stamina"
                    subtitle={gameState.energy < 30 ? 'Sleep Deprived (Warning)' : gameState.energy >= 80 ? 'Well Rested' : 'Moderate'}
                    value={gameState.energy}
                    max={100}
                    unit="%"
                    icon={Zap}
                    accentColor="#38bdf8"
                    delta={statDeltas.energy}
                  />

                  {/* Attendance Card */}
                  <StatCard
                    title="Academic Attendance"
                    subtitle={gameState.attendance >= 75 ? 'Meets 75% Requirement' : 'Below 75% Threshold!'}
                    value={gameState.attendance}
                    max={100}
                    unit="%"
                    icon={GraduationCap}
                    accentColor={gameState.attendance >= 75 ? '#8b5cf6' : '#f59e0b'}
                    delta={statDeltas.attendance}
                  />
                </div>
              </div>

              {/* CORE ACTIONS ROW (Big Interactive Game Control Buttons) */}
              <div className="glass-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-purple-400" />
                      Everyday Student Life Decisions
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose actions to manage your schedule, stamina, and academics.
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Stamina: {gameState.energy}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Sleep */}
                  <button
                    type="button"
                    onClick={handleSleep}
                    className="action-card-btn group"
                    style={{ '--hover-color': 'rgba(99, 102, 241, 0.3)', '--border-color': 'rgba(99, 102, 241, 0.7)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Moon size={22} />
                    </div>
                    <span className="text-xs font-bold text-white">Full Sleep</span>
                    <span className="text-[10px] text-indigo-300 font-mono">+80 E, +5 H</span>
                  </button>

                  {/* Rest */}
                  <button
                    type="button"
                    onClick={handleRest}
                    className="action-card-btn group"
                    style={{ '--hover-color': 'rgba(56, 189, 248, 0.3)', '--border-color': 'rgba(56, 189, 248, 0.7)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                      <Coffee size={22} />
                    </div>
                    <span className="text-xs font-bold text-white">Power Nap</span>
                    <span className="text-[10px] text-sky-300 font-mono">+30 E, +3 H</span>
                  </button>

                  {/* Attend Class */}
                  <button
                    type="button"
                    onClick={handleAttendClass}
                    className="action-card-btn group"
                    style={{ '--hover-color': 'rgba(16, 185, 129, 0.3)', '--border-color': 'rgba(16, 185, 129, 0.7)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <GraduationCap size={22} />
                    </div>
                    <span className="text-xs font-bold text-white">Attend Class</span>
                    <span className="text-[10px] text-emerald-300 font-mono">+2 Attn, -15 E</span>
                  </button>

                  {/* Skip Class */}
                  <button
                    type="button"
                    onClick={handleSkipClass}
                    className="action-card-btn group"
                    style={{ '--hover-color': 'rgba(245, 158, 11, 0.3)', '--border-color': 'rgba(245, 158, 11, 0.7)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <SunMedium size={22} />
                    </div>
                    <span className="text-xs font-bold text-white">Skip Class</span>
                    <span className="text-[10px] text-amber-300 font-mono">-3 Attn, +10 E</span>
                  </button>

                  {/* Random Event Button */}
                  <button
                    type="button"
                    onClick={handleTriggerRandomEvent}
                    className="action-card-btn group"
                    style={{ '--hover-color': 'rgba(168, 85, 247, 0.3)', '--border-color': 'rgba(168, 85, 247, 0.7)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <Sparkles size={22} />
                    </div>
                    <span className="text-xs font-bold text-white">Random Event</span>
                    <span className="text-[10px] text-purple-300 font-mono">Surprise Fate</span>
                  </button>

                  {/* End Day */}
                  <button
                    type="button"
                    onClick={handleEndDay}
                    className="action-card-btn group bg-purple-950/40 border-purple-500/40"
                    style={{ '--hover-color': 'rgba(192, 132, 252, 0.4)', '--border-color': 'rgba(192, 132, 252, 0.9)' }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-200 group-hover:scale-110 transition-transform">
                      <ArrowRight size={22} />
                    </div>
                    <span className="text-xs font-bold text-white">End Day {gameState.day}</span>
                    <span className="text-[10px] text-purple-200 font-mono">New Morning</span>
                  </button>
                </div>
              </div>

              {/* DOUGHNUT CHARTS & MONEY SUMMARY ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3 Doughnut Gauges (8 cols) */}
                <div className="lg:col-span-8 glass-panel p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Vital Capacity Meters</h3>
                      <p className="text-xs text-slate-400">Current levels vs maximum capacity</p>
                    </div>
                    <span className="badge badge-purple text-[10px]">Real-time Meters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                    {/* Happiness Gauge */}
                    <DoughnutChart
                      title="Happiness"
                      value={gameState.happiness}
                      max={100}
                      color="#ec4899"
                      colorEnd="#f43f5e"
                      icon={Heart}
                    />

                    {/* Energy Gauge */}
                    <DoughnutChart
                      title="Energy"
                      value={gameState.energy}
                      max={100}
                      color="#38bdf8"
                      colorEnd="#6366f1"
                      icon={Zap}
                    />

                    {/* Attendance Gauge */}
                    <DoughnutChart
                      title="Attendance"
                      value={gameState.attendance}
                      max={100}
                      color="#10b981"
                      colorEnd="#059669"
                      icon={GraduationCap}
                    />
                  </div>
                </div>

                {/* Money & Spending Breakdown (4 cols) */}
                <div className="lg:col-span-4 glass-panel p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-white">Financial Summary</h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('shop')}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                      >
                        Shop <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 mb-4">
                      <div className="text-xs text-slate-400">Current Balance</div>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        ₹{gameState.money.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Total Spent:</span>
                        <span className="font-mono font-bold text-rose-400">
                          ₹{gameState.totalSpent.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Items Purchased:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {gameState.inventory.length} items
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Academic Standing:</span>
                        <span className={`font-semibold ${gameState.attendance >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {gameState.attendance >= 75 ? 'Eligible for Exams' : 'Attendance Shortage'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('shop')}
                    className="btn btn-primary w-full mt-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} /> Open Campus Shop
                  </button>
                </div>
              </div>

              {/* PROGRESSION CHART & ACTIVITY FEED ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <HistoryChart history={gameState.history} />
                </div>
                <div className="lg:col-span-4">
                  <ActivityFeed history={gameState.history} limit={12} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <ShopView
              playerMoney={gameState.money}
              onBuyItem={handleBuyItem}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={gameState.inventory}
              totalSpent={gameState.totalSpent}
              onNavigateToShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <HistoryChart history={gameState.history} />
              <ActivityFeed history={gameState.history} limit={50} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

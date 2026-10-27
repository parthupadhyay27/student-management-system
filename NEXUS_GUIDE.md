# 🎮 NEXUS: LIFE BEYOND CODE — Real-Life College Simulation Game

> **College Project Submission**  
> **Brand**: NEXUS  
> **Subtitle / Tagline**: LIFE BEYOND CODE  
> **Technology Stack**: React 19, Vite, Recharts, Lucide Icons, Canvas-Confetti, Web Audio API, Pure Dark Glassmorphic Design System.

---

## 🌟 Overview & Core Concept

**NEXUS: LIFE BEYOND CODE** is an interactive, real-life student life simulation game designed to capture the challenges, financial realities, and daily decisions of university life.

As a student, the player manages:
- 💰 **Finances (₹)**: Starting with ₹10,000, budgeting between groceries, caffeine, study fuel, and recreation.
- ❤️ **Happiness (0–100%)**: Managing mental well-being against exam stress and social balance.
- ⚡ **Energy (0–100%)**: Sleep scheduling, morning routines, fatigue, and burnout prevention.
- 🎓 **Attendance (0–100%)**: Meeting university attendance rules (alerting if below 75%).
- 🎒 **Inventory & Purchases**: Tracking all bought items, quantities, categories, and investment totals.
- 🎂 **Aging & Life Stages**: Evolving from `CHILD` (<18), to `STUDENT` (18–21), `WORKING` (22–59), and `RETIRED` (60+).
- 🎲 **Unpredictable Fate**: Random campus events and parental monthly checks.

---

## 🚀 How to Run the Website Locally

### Prerequisites
- Node.js (v20+ or v22+) & npm

### Starting the Web App
1. Open PowerShell or Command Prompt.
2. Navigate into the `nexus-game` folder:
   ```powershell
   cd "c:\Users\Parth\Downloads\college student management system\nexus-game"
   ```
3. Run the development server:
   ```powershell
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

*(To create a production-optimized build, simply run `npm run build` and then `npm run preview`)*.

---

## 🎯 Step-by-Step Demonstration for Your Professor

Follow this guided demo walkthrough during your presentation:

### Step 1: Initial Character Setup & Validation
1. Open `http://localhost:5173/`.
2. Notice the cyber dark welcome screen with NEXUS branding and subtitle *"Life Beyond Code"*.
3. Try clicking **"Begin Your Life Simulation"** with an empty name. Show your professor the built-in validation error banner.
4. Enter your name (e.g. `Arjun Patel`) and age (`20`).
5. Point out how the live avatar preview and life stage chip dynamically calculate `STUDENT` (since age ≥ 18).
6. Click **"Begin Your Life Simulation"**. A welcoming audio chime plays and smoothly transitions to the main dashboard.

### Step 2: Main Dashboard & Vital Gauges
1. **Character Card**: Point out the prominent SVG avatar portrait. Its facial expression, eyebrows, and glowing mood status badge (`THRIVING`, `BALANCED`, `EXHAUSTED`, `DOWNCAST`) react in real-time to stats.
2. **Stat Cards**: Show the 4 stat cards for **Money (₹)**, **Happiness**, **Energy**, and **Attendance**. Each displays real-time delta badges (`+` or `-`) when values change.
3. **Capacity Meters**: Show the 3 circular doughnut progress rings with centered percentages and active-vs-remaining capacity breakdowns.
4. **Financial Summary**: Shows current balance, cumulative spending, and exam eligibility status.

### Step 3: Testing Everyday Game Decisions
1. **Attend Class**:
   - Click **"Attend Class"**.
   - Show how Attendance increases by `+2%`, Energy drops by `-15`, and Happiness changes by `-2`.
   - A success toast appears and the action is recorded in the **Recent Activity Feed**.
2. **Exhaustion Guard (Edge Case)**:
   - Click "Attend Class" until Energy drops below 10.
   - Show how the game safely **rejects the action** with an error message: *"Too exhausted to attend lecture! You need at least 10 Energy"*, keeping stats intact.
3. **Power Nap & Full Sleep**:
   - Click **"Power Nap"** (`+30 Energy`, `+3 Happiness`).
   - Click **"Full Sleep"** (`+80 Energy`, `+5 Happiness`).
   - Show how stats smoothly clamp at `100/100` maximum capacity without overflowing.
4. **Skip Class**:
   - Click **"Skip Class"** (`+10 Energy`, `+3 Happiness`, `-3 Attendance`). Show the warning toast and attendance drop.

### Step 4: Campus Shop & Economics
1. Click **"Campus Shop"** in the sidebar.
2. Filter items by category (`ALL`, `FOOD`, `DRINK`, `ENTERTAINMENT`) or use the search bar.
3. Buy a **Coffee** (₹80):
   - Balance decreases to ₹9,920.
   - Happiness increases by `+3`, Energy increases by `+5`.
   - Coin register sound plays and toast confirms purchase.
4. Buy a **Pizza** (₹250) and a **Video Game** (₹500).
5. Explain how the store prevents negative balances (insufficient funds guard).

### Step 5: Inventory & Possessions Ledger
1. Click **"Inventory"** in the sidebar.
2. Show how purchased items are aggregated into cards with quantity (`x1`, `x2`), unit price, total invested, category badges, and applied effects.
3. Show the total items owned and total spent counters.

### Step 6: Life History & Recharts Dual-Scale Progression
1. Click **"Life History"** in the sidebar or view the chart on the Dashboard.
2. Explain to your professor how Recharts is configured with **dual Y-axes**:
   - Left axis: `0–100%` for Happiness, Energy, and Attendance.
   - Right axis: `₹` currency scale for Money.
3. Click the view mode pills: **"Combined"**, **"Stats (0-100)"**, and **"Finances (₹)"** to demonstrate how large rupee amounts never distort stat readability.

### Step 7: Random Events & Monthly Parental Allowance
1. On the Dashboard, click **"Random Event"** to show unpredictable campus events (Found ₹100, Wholesome Hangout, Surprise Test, Free Coffee, or Quiet Serenity).
2. Click **"End Day"** to simulate night passing (`-20 Energy`, `-5 Happiness`, `Day +1`).
3. Point out the monthly check: every 30 days (`day % 30 === 1`, starting at Day 31), an in-page modal asks whether the player wants to accept ₹10,000 from parents or decline for self-reliance pride.

### Step 8: Birthday Celebration & Life Transitions
1. Click **"Celebrate Birthday"** (or header button).
2. Watch the celebratory confetti blast (`canvas-confetti`), musical fanfare chime, and age increment.
3. When reaching age 22, point out the automated promotion to **`WORKING`**, and at 60 to **`RETIRED`**, with instant visual updates to the avatar clothing, hair, and labels.

### Step 9: Refresh Persistence & New Game Reset
1. Refresh the browser page (`F5`).
2. Show that the player name, day, stats, inventory, and history are completely restored from `localStorage`.
3. Click **"New Game"** (or Settings -> Reset). Show the confirmation dialog preventing accidental data loss, then confirm to show the fresh setup screen.

---

## 📁 Source Code Architecture

```
nexus-game/
├── index.html                     # HTML5 entry with Outfit & Inter Google Fonts
├── vite.config.js                 # Vite bundler configuration
├── package.json                   # React, Recharts, Lucide, Canvas-Confetti
├── src/
│   ├── main.jsx                   # Application mount point
│   ├── App.jsx                    # Central Game Engine, State, Mechanics & Navigation
│   ├── index.css                  # Custom Dark Game Design System (Glassmorphic)
│   ├── App.css                    # Utility and animation styles
│   ├── constants/
│   │   └── gameData.js            # Initial stats, 12 shop items, 5 random events, life stages
│   ├── utils/
│   │   └── audio.js               # Web Audio API Synthesizer (Chimes, Fanfare, Alarms)
│   └── components/
│       ├── Avatar.jsx             # State-driven SVG character with responsive emotions
│       ├── StatCard.jsx           # Metric card with +/- delta badges
│       ├── DoughnutChart.jsx      # Circular progress gauges with centered values
│       ├── HistoryChart.jsx       # Recharts dual-axis progression chart with filter modes
│       ├── ActivityFeed.jsx       # Scrollable log of all actions & stat changes
│       ├── ShopView.jsx           # 12 items with filters, search, and affordability checks
│       ├── InventoryView.jsx      # Aggregated items, quantities, and cost breakdown
│       ├── WelcomeScreen.jsx      # Character creation form with live validation
│       ├── MonthlyAllowanceModal.jsx # Day % 30 === 1 parental allowance modal
│       ├── BirthdayModal.jsx      # Confetti celebration modal with life stage promotions
│       ├── NewGameModal.jsx       # Reset confirmation dialog
│       ├── SettingsModal.jsx      # Sound toggle, reset, and credits
│       └── Toast.jsx              # Animated auto-dismissing toast notifications
```

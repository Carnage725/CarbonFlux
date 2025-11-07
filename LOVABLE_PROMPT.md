# CarbonFlux - High-End Energy Orchestration Dashboard

Build a premium, real-time energy orchestration platform frontend for CarbonFlux - a solar-powered molten-salt storage system feeding algae photobioreactors with carbon capture tracking.

---

## 🎨 DESIGN SYSTEM & AESTHETIC

### Visual Identity
- **Theme**: Dark glassmorphism with emerald/slate color palette
- **Vibe**: Premium industrial tech dashboard, scientific precision meets modern design
- **Inspiration**: Tesla energy dashboards, scientific data visualization tools, high-end monitoring systems

### Color Palette
```css
Primary (Emerald/Green):
- primary-400: #34d399 (accents, active states)
- primary-500: #10b981 (main brand, success states)
- primary-600: #059669 (buttons, interactive elements)

Background (Dark Slate):
- slate-900: #0f172a (main background)
- slate-800: #1e293b (panel backgrounds with 80% opacity)
- slate-700: #334155 (borders with 50% opacity)

Text:
- slate-100: #f1f5f9 (primary text)
- slate-200: #e2e8f0 (headings)
- slate-300: #cbd5e1 (secondary text)
- slate-400: #94a3b8 (labels, muted text)
- slate-500: #64748b (tertiary text)

Accent Colors:
- Cyan: #06b6d4 (water, oxygen, cooling)
- Blue: #3b82f6 (cold temperatures, discharge)
- Orange: #f97316 (hot temperatures, heat)
- Indigo: #6366f1 (pH, chemistry)
- Amber: #f59e0b (warnings)
- Red: #ef4444 (errors, alarms, overtemp)
- Emerald: #10b981 (success, growth, CO2 capture)
```

### Glassmorphism Components
```css
.glass-panel {
  background: rgba(30, 41, 59, 0.8); /* slate-800 at 80% */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.5); /* slate-700 at 50% */
  border-radius: 12px;
  transition: all 300ms ease;
}

.glass-button {
  background: #059669; /* primary-600 */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 300ms ease;
}

.glass-button:hover {
  background: #047857; /* primary-700 */
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
}
```

### Typography
- **Font**: System font stack (San Francisco, Segoe UI, Roboto)
- **Headings**:
  - Page titles: 3xl (1.875rem), font-bold
  - Section headings: xl (1.25rem), font-semibold
  - Card titles: lg (1.125rem), font-semibold
- **Body**: Base size (1rem), font-normal
- **Metrics/Numbers**: 2xl-3xl, font-bold, colored by context
- **Labels**: sm (0.875rem), text-slate-400, uppercase tracking-wide

### Animation Principles
- **Transitions**: 300ms ease for all interactions
- **D3 Charts**: 1000-1500ms cubic-ease-out for line animations
- **Pulse effects**: For live data indicators, alarms
- **Scale transforms**: Subtle hover effects (scale-105)
- **Loading states**: Skeleton screens or pulsing placeholders

---

## 🏗️ APPLICATION STRUCTURE

### Layout Architecture
```
┌─────────────────────────────────────────┐
│  Fixed Sidebar (256px)    Main Content  │
│  ┌──────────────┐        ┌─────────────┐│
│  │              │        │             ││
│  │  CarbonFlux  │        │   Page      ││
│  │  Logo + Nav  │        │   Content   ││
│  │              │        │             ││
│  │  5 Nav Items │        │  (scrolls)  ││
│  │              │        │             ││
│  │              │        │             ││
│  │  Status Info │        │             ││
│  └──────────────┘        └─────────────┘│
└─────────────────────────────────────────┘
```

### Sidebar Navigation
- **Logo Section**: "CarbonFlux" in primary-400, "Energy Orchestration" subtitle in slate-400
- **Nav Items** (with emoji icons):
  1. ⚡ Overview
  2. 🔥 Thermal Twin
  3. ☀️ Forecast Lab
  4. 🧪 Reactor Console
  5. 🌱 Carbon & Exports
- **Footer**: Version number, operational status (green dot + text)

### Responsive Behavior
- Sidebar collapses to hamburger menu on mobile (<768px)
- Charts scale down gracefully, stack vertically on mobile
- Metric tiles go from 4-column grid to 2-column to 1-column

---

## 📄 PAGE SPECIFICATIONS

## PAGE 1: Overview Dashboard

**Purpose**: Real-time system overview with live animated flow diagram

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Overview                                         │
│ Real-time system monitoring                      │
├─────────────────────────────────────────────────┤
│ [Scenario Switcher: Clear Sky ▼]                │
├─────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐ │
│  │        Animated Flow Diagram (SVG)         │ │
│  │   Solar → Salt Storage → Algae Reactors    │ │
│  │     (Animated flows, real-time numbers)    │ │
│  └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  [SOC Gauge]  [Live CO2 Ticker]  [System Metrics]│
└─────────────────────────────────────────────────┘
```

**Components**:
1. **Scenario Switcher** (dropdown)
   - Options: Clear Sky, Cloudy, Heatwave, Maintenance
   - Triggers data reseed via POST /admin/scenario
   - Shows loading state during switch

2. **Flow Diagram** (SVG + D3.js)
   - 3 main nodes: Solar Panel, Salt Tank, Algae Reactor
   - Animated flow lines with moving particles
   - Live power values on each connection
   - Color-coded: Green for solar, orange for heat, cyan for algae
   - Smooth transitions when data updates

3. **SOC Gauge** (Circular progress)
   - Shows battery State of Charge (0-10 MWh)
   - Animated arc with gradient fill
   - Percentage + MWh displayed in center

4. **CO2 Ticker** (Animated counter)
   - Live cumulative CO2 captured
   - Counting animation when value updates
   - Large number with "kg" suffix in green

**Data Flow**:
- Fetches from /forecast/solar, /salt/state, /carbon/ledger on mount
- Updates every 5 seconds (polling or SSE)
- Scenario switch triggers full data reload

---

## PAGE 2: Thermal Twin

**Purpose**: Deep dive into molten-salt thermal storage with temperature tracking

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Thermal Twin                                     │
│ Molten-salt storage simulation                   │
├─────────────────────────────────────────────────┤
│  [Current SOC: X MWh]  [Hot: 565°C]  [Cold: 290°C] │
├─────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐ │
│  │    Dual-Axis Temperature + SOC Chart       │ │
│  │  (Hot/Cold temps + SOC overlay, 24h)       │ │
│  │  With dispatch event markers               │ │
│  └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  [Heat Loss Donut Chart]  [Efficiency Metrics]  │
└─────────────────────────────────────────────────┘
```

**Components**:
1. **Metric Tiles** (3 tiles)
   - Current SOC (MWh, with percentage)
   - Hot Tank Temperature (°C, orange color)
   - Cold Tank Temperature (°C, blue color)

2. **Thermal Chart** (D3.js, 900x400px)
   - **X-axis**: Time (last 24 hours)
   - **Left Y-axis**: Temperature (°C, 280-600 range)
   - **Right Y-axis**: SOC (MWh, 0-10 range)
   - **Lines**:
     - Orange line: Hot tank temp (solid)
     - Blue line: Cold tank temp (solid)
     - Green dashed line: SOC
   - **Background markers**: Vertical stripes for charge/discharge events
   - **Animation**: Line draw-in effect (1000ms)

3. **Heat Loss Donut** (D3.js donut chart)
   - Shows heat loss breakdown
   - Animated on load

4. **Efficiency Tile**
   - Round-trip efficiency percentage
   - Visual progress bar

**Data Flow**:
- GET /salt/state → current state + 24h history
- GET /dispatch/plan → overlay charge/discharge events

---

## PAGE 3: Forecast Lab

**Purpose**: Interactive solar forecast visualization with percentile bands

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Forecast Lab                                     │
│ Solar generation forecasting                     │
├─────────────────────────────────────────────────┤
│  [Current: X kW]  [Peak Today: Y kW]  [24h: Z kWh] │
├─────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐ │
│  │   P5-P50-P95 Fan Chart with Green Windows  │ │
│  │   (Area chart showing uncertainty bands)    │ │
│  │   Draggable handles for custom scenarios    │ │
│  └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  [Green Windows Table - Low Carbon Intervals]   │
└─────────────────────────────────────────────────┘
```

**Components**:
1. **Forecast Chart** (D3.js area chart)
   - **X-axis**: Time (nowcast 5-15min + forecast 24-72h)
   - **Y-axis**: Power (kW)
   - **Layers**:
     - P5-P95 band: Light green fill (10% opacity)
     - P50 line: Solid green line (median forecast)
     - Green window ribbons: Emerald background bands
   - **Interactivity**: Draggable handles to adjust forecast (demo only)
   - **Animation**: Fan chart expands from center line

2. **Green Windows Panel**
   - List/table of low-carbon energy intervals
   - Each row: Start time, End time, Carbon intensity, Duration
   - Highlighted in emerald when active

**Data Flow**:
- GET /forecast/solar → nowcast + forecast arrays
- GET /forecast/green-windows → carbon intensity intervals

---

## PAGE 4: Reactor Console

**Purpose**: Live bioreactor telemetry monitoring with alarm system

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Reactor Console  [●Live]                         │
│ Live algae photobioreactor telemetry             │
├─────────────────────────────────────────────────┤
│  [pH: 7.16]  [DO: 5.85 mg/L]  [Temp: 24.2°C]  [CO2: -0.18 kg/h] │
├─────────────────────────────────────────────────┤
│ Alarms: [✓ All Systems Normal] or [⚠ Warnings]  │
├─────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐ │
│  │  ┌──────────┐  ┌──────────┐              │ │
│  │  │ pH Chart │  │ DO Chart │              │ │
│  │  └──────────┘  └──────────┘              │ │
│  │  ┌──────────┐  ┌──────────┐              │ │
│  │  │Temp Chart│  │CO2 Chart │              │ │
│  │  └──────────┘  └──────────┘              │ │
│  └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  Reactor Controls:                               │
│  [💨 Degas Now]  [🌊 Aerate Burst]  [🌙 Night Mode] │
└─────────────────────────────────────────────────┘
```

**Components**:
1. **Live Indicator**
   - Animated green pulse dot + "Live" text
   - Shows SSE connection status

2. **Metric Tiles** (4 tiles, real-time updates)
   - pH (indigo), DO (cyan), Temp (orange), CO2 uptake (green/purple)

3. **Alarm Badges** (pill-shaped, animated)
   - "✓ All Systems Normal" (green, pulsing)
   - "⚠ O₂ Inhibition Risk" (amber, if DO > 10)
   - "⚠ pH Out of Range" (red, if pH < 6.8 or > 7.6)
   - "⚠ Overtemp" (red, if temp > 28°C)

4. **Four D3 Charts** (450x200px each, 2x2 grid):
   - **pH Chart**: Line with safe band shading (6.8-7.6 green zone)
   - **DO Chart**: Line with danger zones (<4 red, >10 amber)
   - **Temp Chart**: Line with comfort envelope (22-28°C green)
   - **CO2 Uptake Chart**: Line with area fill, shows day/night pattern

5. **Control Buttons** (3 buttons)
   - "💨 Degas Now" (cyan) - reduces DO temporarily
   - "🌊 Aerate Burst" (blue) - increases DO temporarily
   - "🌙 Night Mode" (indigo) - reduces CO2 uptake
   - Active state: Pulsing animation + green indicator
   - Calls POST /algae/control with action

**Data Flow**:
- SSE stream from /algae/telemetry/stream (updates every 2 seconds)
- Fetches initial 2h history from GET /algae/telemetry?hours=2
- Charts update smoothly without full redraw

---

## PAGE 5: Carbon & Exports

**Purpose**: Carbon capture ledger with audit export functionality

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Carbon & Exports                                 │
│ Carbon capture ledger and audit artifacts        │
├─────────────────────────────────────────────────┤
│ [Total In: X kg] [Fixed: Y kg] [Net: Z kg]      │
├─────────────────────────────────────────────────┤
│  Carbon Capture Trends                           │
│  [📄 Export CSV] [📋 Export JSON] [🪙 Mint Credit] │
│  ┌────────────────────────────────────────────┐ │
│  │    Cumulative Net CO2 Line Chart           │ │
│  │    (Growing line from 0 to total)          │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │    Daily Net CO2 Bar Chart                 │ │
│  │    (Bars for each day, green for positive) │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Components**:
1. **Summary Tiles** (3 tiles)
   - Total CO₂ In (kg, white)
   - Total CO₂ Fixed (kg, cyan, with % conversion)
   - Net Captured (kg, emerald, with metric tons)

2. **Export Buttons** (3 buttons)
   - "📄 Export CSV" - Downloads carbon_ledger.csv
   - "📋 Export JSON" - Downloads carbon_ledger.json
   - "🪙 Mint Demo Credit" - Special animated button with gradient, downloads audit JSON, shows modal on success

3. **Cumulative Chart** (D3.js line chart, 900x300px)
   - Line chart showing cumulative CO2 over time
   - Area fill under curve (emerald, 20% opacity)
   - Animated line draw from left to right
   - Final value annotation at end

4. **Daily Bar Chart** (D3.js bar chart, 900x300px)
   - Bar chart showing daily net capture
   - Green bars for positive, red for negative (if any)
   - Animated bars growing from bottom
   - Hover effects on bars

5. **Mint Success Modal** (overlay)
   - Shows "✨ Demo Credit Minted!" with animation
   - Auto-dismisses after 2 seconds

**Data Flow**:
- GET /carbon/ledger → daily rollups + cumulative
- GET /carbon/ledger?export=csv → triggers CSV download
- GET /carbon/ledger?export=json → triggers JSON download

---

## 🎯 D3.JS CHART SPECIFICATIONS

### General Chart Principles
- **Margins**: { top: 20, right: 40-80, bottom: 40-60, left: 60-80 }
- **Colors**: Match design system (emerald primary, slate text, accent colors per data type)
- **Axes**:
  - Color: #64748b (slate-500)
  - Font size: 12px
  - Tick count: 6-8 for Y, auto for X
- **Grid lines**: Optional, 10% opacity, horizontal only
- **Animations**:
  - Line charts: Stroke-dasharray draw-in effect (1000ms, ease-cubic-out)
  - Bars: Height transition from 0 (600ms, delay stagger by index * 30ms)
  - Area charts: Opacity fade-in + clip-path reveal
- **Tooltips**: Consider adding on hover (position absolute, glass-panel styling)

### Responsive Charts
- Use refs + useEffect for D3 rendering
- Clear SVG on data change: `svg.selectAll('*').remove()`
- Recalculate dimensions on window resize (debounced)

---

## 🔌 API INTEGRATION

### Backend Base URL
```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
```

### Endpoints Summary
```typescript
// Forecast
GET /forecast/solar → { nowcast: [], forecast: [], generated_at }
GET /forecast/green-windows → { windows: [], count }

// Salt Storage
GET /salt/state → { current: {}, history_24h: [], capacity_mwh, soc_percent }
POST /salt/simulate → { feasible, schedule: [], final_soc_mwh, ... }

// Dispatch
POST /dispatch/plan → { plan: [], total_charge_kwh, total_discharge_kwh, ... }

// Algae Telemetry
GET /algae/telemetry?hours=24 → { data: [], count, time_range }
GET /algae/telemetry/stream → SSE stream (text/event-stream)
POST /algae/control → { success, action, message, duration_seconds }

// Carbon Ledger
GET /carbon/ledger → { daily: [], cumulative_net_kg, total_days }
GET /carbon/ledger?export=csv → CSV file download
GET /carbon/ledger?export=json → JSON file download

// Admin
POST /admin/seed?reset=1 → Reseed database
POST /admin/scenario?type=cloudy → Switch scenario
```

### API Utilities (lib/api.ts)
```typescript
export const api = {
  async get(path: string) {
    const res = await fetch(`${API_BASE}${path}`)
    if (!res.ok) throw new Error(`API error: ${res.statusText}`)
    return res.json()
  },
  async post(path: string, data?: unknown) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!res.ok) throw new Error(`API error: ${res.statusText}`)
    return res.json()
  }
}

export const downloadFile = async (path: string, defaultFilename: string) => {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error('Download failed')
  const contentDisposition = res.headers.get('Content-Disposition')
  let filename = defaultFilename
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/i)
    if (match) filename = match[1]
  }
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
```

### SSE (Server-Sent Events) Hook
```typescript
export function useSSE(url: string, options = {}) {
  const [data, setData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onopen = () => setIsConnected(true)
    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data)
      setData(parsed)
      options.onMessage?.(parsed)
    }
    eventSource.onerror = (err) => {
      setIsConnected(false)
      eventSource.close()
    }

    return () => eventSource.close()
  }, [url])

  return { data, isConnected }
}
```

---

## 📦 TECH STACK REQUIREMENTS

### Core Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.x",
  "d3": "^7.9.0",
  "zustand": "^4.x (optional state management)",
  "tailwindcss": "^3.4.0"
}
```

### File Structure
```
src/
├── main.tsx                 # App entry
├── App.tsx                  # Router setup
├── index.css                # Tailwind + custom styles
├── components/
│   ├── Layout.tsx           # Sidebar + outlet
│   ├── ScenarioSwitcher.tsx
│   ├── FlowDiagram.tsx      # SVG flow (Overview)
│   ├── SOCGauge.tsx         # Circular gauge
│   ├── CarbonTicker.tsx     # Counter animation
│   ├── ThermalChart.tsx     # Dual-axis chart (Thermal)
│   ├── HeatLossDonut.tsx
│   ├── EfficiencyTile.tsx
│   ├── SolarForecastChart.tsx # Fan chart (Forecast)
│   ├── PHChart.tsx          # pH chart (Reactor)
│   ├── DOChart.tsx          # DO chart
│   ├── TempChart.tsx        # Temp chart
│   ├── CO2UptakeChart.tsx   # CO2 chart
│   ├── AlarmBadges.tsx      # Alarm pills
│   ├── ReactorControls.tsx  # Control buttons
│   ├── CumulativeCO2Chart.tsx # Line chart (Carbon)
│   └── DailyCO2BarChart.tsx # Bar chart
├── pages/
│   ├── Overview.tsx
│   ├── ThermalTwin.tsx
│   ├── ForecastLab.tsx
│   ├── ReactorConsole.tsx
│   └── Carbon.tsx
├── hooks/
│   └── useSSE.ts            # SSE hook
├── lib/
│   └── api.ts               # API utilities
└── store/ (optional)
    └── appStore.ts          # Zustand store
```

---

## ✨ PREMIUM FEATURES & POLISH

### Micro-interactions
1. **Hover Effects**:
   - Buttons: Slight lift (translateY(-2px)) + glow shadow
   - Nav items: Background fade-in
   - Chart elements: Tooltip + highlight

2. **Loading States**:
   - Skeleton screens for charts
   - Pulsing placeholders for metrics
   - Spinner for async actions

3. **Success Feedback**:
   - Green checkmark animation on successful actions
   - Toast notifications (consider react-hot-toast)
   - Modal overlays with backdrop blur

4. **Live Indicators**:
   - Pulsing green dot for SSE connection
   - Animated "Live" badge
   - Real-time number counting animations

### Performance Optimizations
- **Chart Updates**: Don't redraw entire chart, use D3 transitions
- **SSE Throttling**: Limit updates to 5-10 messages/sec for smooth rendering
- **Data Decimation**: For large datasets (>1000 points), use largest-triangle-three-buckets algorithm
- **Lazy Loading**: Code-split pages with React.lazy()
- **Memoization**: useMemo for expensive chart data transformations

### Accessibility
- Semantic HTML (nav, main, aside, article)
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratios meeting WCAG AA
- Focus states visible on all interactive elements

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Set up React + Vite + TypeScript
- [ ] Configure Tailwind with custom theme
- [ ] Create Layout component with sidebar
- [ ] Set up React Router with 5 pages
- [ ] Build API utility functions
- [ ] Create SSE hook

### Phase 2: Overview Page
- [ ] Scenario switcher dropdown
- [ ] Animated SVG flow diagram (basic version)
- [ ] SOC circular gauge
- [ ] CO2 counter ticker
- [ ] Wire up API calls

### Phase 3: Thermal Twin
- [ ] Metric tiles (SOC, hot/cold temps)
- [ ] Dual-axis temperature chart with D3
- [ ] Heat loss donut chart
- [ ] Efficiency tile

### Phase 4: Forecast Lab
- [ ] Solar forecast metric tiles
- [ ] P5-P50-P95 fan chart with area fills
- [ ] Green windows table/list
- [ ] Draggable handles (optional advanced feature)

### Phase 5: Reactor Console
- [ ] Real-time metric tiles
- [ ] SSE integration with live indicator
- [ ] 4 D3 charts (pH, DO, Temp, CO2)
- [ ] Alarm badge system
- [ ] Control buttons panel

### Phase 6: Carbon & Exports
- [ ] Summary tiles with calculations
- [ ] Cumulative line chart
- [ ] Daily bar chart
- [ ] Export CSV/JSON functionality
- [ ] Mint credit button with modal

### Phase 7: Polish
- [ ] Smooth transitions everywhere
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Accessibility improvements

---

## 🎬 ANIMATION SHOWCASE MOMENTS

These are the "wow" moments that make the app feel premium:

1. **Page Load**: Stagger-fade-in of components (delay by 100ms each)
2. **Flow Diagram**: Particles flowing along paths
3. **Chart Reveals**: Line drawing animations synchronized
4. **Scenario Switch**: Smooth cross-fade of all data
5. **Live Updates**: Pulsing indicators + smooth number transitions
6. **Alarm Triggers**: Shake animation + color change
7. **Export Success**: Checkmark animation + download trigger
8. **Mint Credit**: Gradient button shimmer + modal explosion effect

---

## 📝 LOVABLE-SPECIFIC INSTRUCTIONS

**When building this in Lovable:**

1. Start with the Layout and routing structure first
2. Build pages incrementally, starting with Overview
3. For D3 charts, create separate component files - don't inline SVG logic
4. Use Tailwind classes extensively, avoid custom CSS unless necessary for animations
5. Keep API calls in a centralized api.ts file
6. Test SSE connection with mock data if backend isn't ready
7. Focus on responsiveness from the start - test mobile views
8. Add TypeScript interfaces for all data structures
9. Use React best practices: functional components, hooks, no prop drilling
10. Optimize re-renders with useMemo/useCallback for expensive operations

**Priority Order**:
1. Core layout + navigation (must work perfectly)
2. Overview page (main dashboard impression)
3. Reactor Console (shows off live data + SSE)
4. Other pages in any order
5. Polish and micro-interactions last

**Design Tokens to Configure**:
```javascript
// In tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: { /* emerald shades */ },
    },
    backdropBlur: {
      xs: '2px',
    },
    animation: {
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }
  }
}
```

---

## 🎯 SUCCESS CRITERIA

The frontend is successful when:
- ✅ Loads in <2 seconds on fast connection
- ✅ All 5 pages render without errors
- ✅ SSE connection works and shows live data on Reactor Console
- ✅ All D3 charts animate smoothly
- ✅ Export buttons download actual files
- ✅ Scenario switching updates all data
- ✅ Responsive on mobile, tablet, desktop
- ✅ No console errors or warnings
- ✅ Professional, polished appearance
- ✅ Users say "wow" when they see the flow diagram and live charts

---

**Build a dashboard that feels like it costs $50k/year to use. Premium. Scientific. Alive.**

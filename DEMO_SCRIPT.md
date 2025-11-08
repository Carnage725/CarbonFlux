# CarbonFlux Automated Demo Script

## 🎭 Overview

CarbonFlux now includes a fully automated demo script that provides a Hollywood-grade walkthrough of the entire energy orchestration platform. This script automatically navigates through scenarios, demonstrates system capabilities, and showcases real-time adaptations.

## 🚀 Quick Start

### Prerequisites
- CarbonFlux is running: `docker-compose up`
- Frontend accessible at: http://localhost:5173

### Launch Demo
1. Open http://localhost:5173 in your browser
2. Click the **"Demo"** button in the top-right corner
3. The demo controller will appear with full controls

## 🎬 Demo Flow

The automated demo consists of **10 sequential steps** that take approximately **3-4 minutes** to complete:

### Step 1: Setup (5s) - Clear Sky Conditions
- **What happens**: System initializes with optimal "Clear Sky" scenario
- **What it shows**: Baseline performance with 700-1000 kW solar generation
- **Key message**: "Starting with perfect conditions to show system at peak performance"

### Step 2: System Overview (10s) - Real-Time Energy Flow
- **What happens**: Displays main dashboard with live metrics
- **What it shows**:
  - Solar generation: ~847 kW
  - Storage SOC: 78% (7.82 MWh)
  - CO₂ captured: 936 kg cumulative
  - Flow diagram: Solar → Storage → Algae Load
- **Key message**: "Watch real-time energy flowing from solar panels through thermal storage to power algae cultivation"

### Step 3: Weather Impact (15s) - Cloudy Scenario Switch
- **What happens**: Automatically switches to "Cloudy" scenario
- **What it shows**:
  - Solar forecast drops from 900 kW to 600 kW
  - Uncertainty bands widen (P5-P95 range)
  - Green windows shift to different time periods
  - System adapts dispatch automatically
- **Key message**: "This is the magic moment - watch how the entire system adapts to weather changes in real-time"

### Step 4: Thermal Storage (10s) - Battery Performance
- **What happens**: Navigates to Thermal Twin page
- **What it shows**:
  - Hot tank: 575°C, Cold tank: 295°C
  - Round-trip efficiency: 93%
  - Heat loss: 12 kW current
  - Temperature correlation with SOC
- **Key message**: "Our molten-salt battery maintains 575°C - that's hotter than lava and enables 93% efficient energy storage"

### Step 5: Forecast Lab (8s) - Interactive Planning
- **What happens**: Opens Forecast Lab with planning tools
- **What it shows**:
  - 72-hour solar forecast with uncertainty bands
  - Green window overlays (optimal low-carbon periods)
  - Interactive dispatch planning interface
- **Key message**: "Grid operators can plan 72 hours ahead, seeing exactly when clean energy will be available"

### Step 6: Reactor Console (5s) - Live Telemetry
- **What happens**: Shows bioreactor monitoring dashboard
- **What it shows**:
  - pH: 7.16, DO: 5.85 mg/L, Temp: 24.2°C
  - CO₂ uptake: -0.18 kg/h (nighttime respiration)
  - Real-time telemetry updates
- **Key message**: "Live bioreactor telemetry - negative CO₂ means it's nighttime, algae are 'breathing' like we do"

### Step 7: Control Actions (8s) - Degas Demonstration
- **What happens**: Triggers "Degas Now" control action
- **What it shows**:
  - Dissolved oxygen reduction
  - System response to manual intervention
  - Real-time parameter changes
- **Key message**: "Watch the system respond to manual controls - this is how operators manage bioreactor health"

### Step 8: Carbon Accounting (5s) - Audit Trail
- **What happens**: Opens Carbon & Exports page
- **What it shows**:
  - Total captured: 936 kg CO₂
  - Daily breakdown: 31 kg/day average
  - Net capture accounting (fixed - respired)
- **Key message**: "Every kilogram of CO₂ captured is tracked for carbon credit verification"

### Step 9: Data Export (5s) - Compliance Verification
- **What happens**: Demonstrates JSON export functionality
- **What it shows**:
  - Complete audit trail download
  - Timestamped carbon capture data
  - Compliance-ready export format
- **Key message**: "For carbon markets, you need auditable data - this export feeds directly into verification systems"

### Step 10: Completion (5s) - Summary
- **What happens**: Returns to overview with final metrics
- **What it shows**: Complete system status summary
- **Key message**: "CarbonFlux demonstrates how renewable energy can be predictable, optimized, and carbon-negative"

## 🎛️ Demo Controller Features

### Speed Controls
- **🐌 Slow (1.5x)**: Extended timing for detailed explanations (4-5 minutes total)
- **🚶 Normal (1x)**: Standard pace for presentations (3-4 minutes total)
- **🏃 Fast (0.5x)**: Accelerated for quick demos (2-3 minutes total)

### Navigation Options
- **▶️ Start/Stop**: Begin or halt the automated sequence
- **⬅️ Previous/➡️ Next**: Manual step navigation
- **Step Grid**: Click any numbered step to jump directly to it
- **Progress Bar**: Visual completion indicator

### Real-Time Status
- **Current Step**: What's happening now with description
- **Time Remaining**: Countdown for current step
- **Connection Status**: API health monitoring
- **System Metrics**: Live data during demo

## 🎯 Demo Best Practices

### For Technical Presentations
1. **Start with Slow speed** for detailed explanations
2. **Pause at Step 3** (Cloudy scenario) to emphasize system adaptation
3. **Highlight live telemetry** in Step 6
4. **Emphasize audit trail** in Steps 8-9

### For Executive Presentations
1. **Use Normal speed** for brisk pace
2. **Focus on business value**: Energy predictability, carbon credits, system efficiency
3. **Skip technical details** in thermal storage explanation
4. **Emphasize ROI**: 93% efficiency, automated optimization

### For Developer Demos
1. **Use Fast speed** to show full capability quickly
2. **Highlight API endpoints** and real-time data flow
3. **Demonstrate scenario switching** and system adaptation
4. **Show export functionality** for data integration

## 🔧 Troubleshooting

### Demo Won't Start
- **Check**: Is CarbonFlux running? `docker-compose ps`
- **Fix**: Restart services: `docker-compose restart`
- **Check**: API health at http://localhost:8000/healthz

### Steps Not Advancing
- **Check**: Network connectivity to API
- **Fix**: Refresh browser or check API status
- **Alternative**: Use manual navigation buttons

### Data Not Updating
- **Check**: Scenario switch may have failed
- **Fix**: Manually switch scenarios using the scenario dropdown
- **Check**: SSE connection status in bottom status bar

### Performance Issues
- **Check**: Browser developer tools for memory usage
- **Fix**: Close other browser tabs
- **Alternative**: Use Fast speed setting

## 🎪 Advanced Demo Features

### Custom Scenarios
The demo uses predefined scenarios, but you can create custom ones:
```bash
# Add new scenario via API
curl -X POST "http://localhost:8000/admin/scenario?type=storm"
```

### Extended Telemetry
For longer demos, increase telemetry history:
```bash
# Get 7 days of algae data
curl "http://localhost:8000/algae/telemetry?hours=168"
```

### Performance Testing
Trigger large dataset rendering:
```bash
# Generate 100k data points for chart stress test
curl "http://localhost:8000/demo/big?points=100000&type=solar"
```

## 📊 Demo Metrics & Impact

### Technical Metrics
- **API Response Time**: <50ms average
- **SSE Update Rate**: 5-10 messages/second
- **Chart Rendering**: 60 FPS smooth animations
- **Data Points**: 47,520 per table (minute granularity)

### Business Impact
- **Energy Predictability**: 72-hour forecast accuracy
- **Carbon Capture**: 31 kg CO₂/day per system
- **System Efficiency**: 93% round-trip thermal storage
- **Operational Cost**: Automated optimization

## 🎭 Demo Script Customization

### Adding New Steps
Edit `frontend/src/hooks/useDemoScript.ts`:
```typescript
{
  id: 'custom-step',
  title: 'Custom Feature',
  description: 'Showcase your new capability',
  action: async () => { /* Your custom logic */ },
  duration: 10,
  page: '/your-page'
}
```

### Modifying Timing
Adjust step durations in the demo configuration for your audience's attention span.

### Scenario Integration
Add new scenarios to the demo flow by extending the step sequence.

---

## 🎯 Success Checklist

- [ ] Demo launches without errors
- [ ] All 10 steps complete successfully
- [ ] Scenario switching works smoothly
- [ ] Live data updates throughout
- [ ] Export functionality demonstrates
- [ ] Audience engaged and following along
- [ ] Q&A handles technical questions
- [ ] Call-to-action clear for next steps

**Remember**: The demo isn't just showing features—it's proving that **renewable energy can be predictable, optimized, and carbon-negative at scale**. Use the automated script to deliver this message consistently and powerfully! 🚀
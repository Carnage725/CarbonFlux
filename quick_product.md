Quick Product Pitch & Customer Value

  What is CarbonFlux?

  A real-time energy orchestration dashboard that visualizes
  solar-powered energy storage feeding algae bioreactors for carbon
  capture. Think: Tesla Powerwall meets industrial biotech monitoring.

  ---
  Who Buys This?

  1. Industrial Facilities with:
    - Solar + battery storage systems
    - Algae cultivation operations
    - Carbon capture requirements
    - Need for real-time energy optimization
  2. Potential Customers:
    - Wastewater treatment plants (algae for CO₂ capture)
    - Carbon credit companies
    - Green hydrogen producers
    - Industrial carbon offset programs
    - Research labs studying bioenergy

  ---
  What Can Customers Do?

  Operational Monitoring:

  - Monitor battery SOC in real-time
  - Track solar generation vs forecast
  - Watch algae reactor health (pH, DO, temp, CO₂ uptake)
  - Get alarms for out-of-range conditions

  Planning & Optimization:

  - View 72-hour solar forecasts
  - Plan charge/discharge schedules
  - Identify low-carbon energy windows
  - Optimize reactor feeding times

  Compliance & Reporting:

  - Track cumulative CO₂ captured
  - Export carbon ledger (CSV/JSON) for audits
  - Generate carbon credit documentation
  - Prove green energy usage for compliance

  Control:

  - Switch between operating scenarios (clear/cloudy/heatwave)
  - Trigger reactor controls (degas, aerate, night mode)
  - Simulate different dispatch strategies

  ---
  How Do You Input Data?

  Currently: Simulated/Demo Data (auto-generated)

  For Production Use:

  1. Hardware Integration (would need custom development):
  Solar Inverter → MQTT/API → CarbonFlux
  Battery BMS → Modbus → CarbonFlux
  Algae Sensors → REST API → CarbonFlux
  Weather API → Forecast ingestion
  2. Manual Entry (would add):
    - Admin panel to adjust scenarios
    - Batch CSV upload for historical data
    - API endpoints to POST sensor readings
  3. Third-Party Integrations:
    - Solar forecast APIs (Solcast, NREL)
    - Grid carbon intensity APIs
    - IoT platforms (AWS IoT, Azure IoT Hub)

  ---
  Value Proposition:

  "See your carbon capture in real-time. Prove it to regulators. 
  Optimize it for profit."

  - ROI: Maximize carbon credits by optimizing reactor uptime
  - Compliance: Instant audit-ready reports
  - Operations: Reduce downtime with live alarms
  - Planning: Forecast-driven scheduling saves 10-20% energy costs

  ---
  Current State:

  ✅ Beautiful demo with simulated data❌ No hardware integrations
  yet❌ No data input UI

  To sell: You'd need to add sensor integrations OR position as a
  visualization layer that sits on top of existing SCADA/IoT systems.
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface ForecastPoint {
  time: string
  value_kw: number
  p5: number
  p50: number
  p95: number
}

interface GreenWindow {
  start_time: string
  end_time: string
  carbon_gco2_kwh: number
}

interface Props {
  forecast: ForecastPoint[]
  greenWindows?: GreenWindow[]
}

export default function SolarForecastChart({ forecast, greenWindows = [] }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !forecast.length) return

    const svg = d3.select(svgRef.current)
    const width = 1000
    const height = 450
    const margin = { top: 20, right: 40, bottom: 50, left: 60 }

    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse times
    const parseTime = (t: string) => new Date(t)
    const parsedData = forecast.map((d) => ({
      ...d,
      parsedTime: parseTime(d.time),
    }))

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.parsedTime) as [Date, Date])
      .range([0, width - margin.left - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.p95) || 1000])
      .range([height - margin.top - margin.bottom, 0])
      .nice()

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10)
    const yAxis = d3.axisLeft(yScale).ticks(8)

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')

    g.append('g').call(yAxis).attr('color', '#64748b')

    // Labels
    g.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', height - margin.top - margin.bottom + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', 12)
      .text('Time')

    g.append('text')
      .attr('x', -height / 2 + margin.top)
      .attr('y', -40)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', 12)
      .text('Solar Power (kW)')

    // Green window ribbons
    greenWindows.forEach((window) => {
      const start = parseTime(window.start_time)
      const end = parseTime(window.end_time)
      const x1 = xScale(start)
      const x2 = xScale(end)

      // Color intensity based on carbon (lower = darker green)
      const opacity = Math.max(0.15, 1 - window.carbon_gco2_kwh / 200)

      g.append('rect')
        .attr('x', x1)
        .attr('y', 0)
        .attr('width', x2 - x1)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', '#10b981')
        .attr('opacity', opacity)
        .attr('pointer-events', 'all')
        .append('title')
        .text(`Green Window\n${window.start_time} - ${window.end_time}\n${window.carbon_gco2_kwh.toFixed(0)} gCO2/kWh`)
    })

    // Fan area (p5 to p95)
    const fanArea = d3
      .area<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y0((d) => yScale(d.p5))
      .y1((d) => yScale(d.p95))
      .curve(d3.curveMonotoneX)

    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'fan-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.3)

    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.1)

    g.append('path')
      .datum(parsedData)
      .attr('fill', 'url(#fan-gradient)')
      .attr('d', fanArea)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 1)

    // P50 line
    const p50Line = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => yScale(d.p50))
      .curve(d3.curveMonotoneX)

    const p50Path = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 3)
      .attr('d', p50Line)

    // Animate line
    const totalLength = p50Path.node()?.getTotalLength() || 0
    p50Path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)

    // Legend
    const legend = g.append('g').attr('transform', `translate(${width - margin.left - margin.right - 200}, 20)`)

    legend
      .append('rect')
      .attr('width', 30)
      .attr('height', 15)
      .attr('fill', 'url(#fan-gradient)')

    legend.append('text').attr('x', 35).attr('y', 12).attr('fill', '#94a3b8').attr('font-size', 12).text('P5-P95 Range')

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 35)
      .attr('y2', 35)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 3)

    legend.append('text').attr('x', 35).attr('y', 40).attr('fill', '#94a3b8').attr('font-size', 12).text('P50 (Median)')
  }, [forecast, greenWindows])

  return (
    <div className="flex items-center justify-center overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  )
}

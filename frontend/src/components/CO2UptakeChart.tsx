import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  time: string
  co2_uptake_kg_h: number
}

interface Props {
  data: DataPoint[]
}

export default function CO2UptakeChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    const width = 450
    const height = 200
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }

    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse times
    const parseTime = (t: string) => new Date(t)
    const parsedData = data.map((d) => ({
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
      .domain([
        Math.min(-0.5, d3.min(parsedData, (d) => d.co2_uptake_kg_h) || -0.5),
        Math.max(2.0, d3.max(parsedData, (d) => d.co2_uptake_kg_h) || 2.0),
      ])
      .range([height - margin.top - margin.bottom, 0])

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisLeft(yScale).ticks(6)

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')

    g.append('g').call(yAxis).attr('color', '#64748b')

    // Zero line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5)

    // Day zone (positive uptake) - shading
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale(0))
      .attr('fill', '#10b981')
      .attr('opacity', 0.05)

    // Night zone (negative uptake / respiration) - shading
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(0))
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom - yScale(0))
      .attr('fill', '#6366f1')
      .attr('opacity', 0.05)

    // Area under curve
    const area = d3
      .area<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y0(yScale(0))
      .y1((d) => yScale(d.co2_uptake_kg_h))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(parsedData)
      .attr('fill', '#10b981')
      .attr('opacity', 0.2)
      .attr('d', area)

    // CO2 uptake line
    const line = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => yScale(d.co2_uptake_kg_h))
      .curve(d3.curveMonotoneX)

    const path = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2.5)
      .attr('d', line)

    // Animate line
    const totalLength = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)

    // Title
    g.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text('CO₂ Uptake Rate')

    // Y-axis label
    g.append('text')
      .attr('x', -height / 2 + margin.top)
      .attr('y', -35)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('kg/h')

    // Day/Night labels
    g.append('text')
      .attr('x', width - margin.left - margin.right - 10)
      .attr('y', 15)
      .attr('text-anchor', 'end')
      .attr('fill', '#10b981')
      .attr('font-size', '11px')
      .attr('opacity', 0.7)
      .text('Day (uptake)')

    g.append('text')
      .attr('x', width - margin.left - margin.right - 10)
      .attr('y', height - margin.top - margin.bottom - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#6366f1')
      .attr('font-size', '11px')
      .attr('opacity', 0.7)
      .text('Night (respiration)')
  }, [data])

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

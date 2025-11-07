import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DailyPoint {
  day: string
  total_co2_net_kg: number
}

interface Props {
  data: DailyPoint[]
}

export default function DailyCO2BarChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    const width = 900
    const height = 300
    const margin = { top: 20, right: 40, bottom: 60, left: 80 }

    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Parse dates
    const parsedData = data.map((d) => ({
      day: new Date(d.day),
      total_co2_net_kg: d.total_co2_net_kg,
    }))

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(parsedData.map((d) => d.day.toISOString()))
      .range([0, width - margin.left - margin.right])
      .padding(0.2)

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.total_co2_net_kg) || 0])
      .nice()
      .range([height - margin.top - margin.bottom, 0])

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => {
        const date = new Date(d as string)
        return d3.timeFormat('%b %d')(date)
      })
      .tickValues(
        parsedData
          .filter((_, i) => i % Math.ceil(parsedData.length / 10) === 0)
          .map((d) => d.day.toISOString())
      )

    const yAxis = d3.axisLeft(yScale).ticks(6)

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    g.append('g').call(yAxis).attr('color', '#64748b')

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ''))

    // Bars
    g.selectAll('.bar')
      .data(parsedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.day.toISOString()) || 0)
      .attr('y', height - margin.top - margin.bottom)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (d) => (d.total_co2_net_kg > 0 ? '#10b981' : '#ef4444'))
      .attr('opacity', 0.8)
      .on('mouseenter', function () {
        d3.select(this).attr('opacity', 1)
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.8)
      })
      .transition()
      .delay((_, i) => i * 30)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(d.total_co2_net_kg))
      .attr('height', (d) => height - margin.top - margin.bottom - yScale(d.total_co2_net_kg))

    // Title
    g.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .text('Daily Net CO₂ Capture')

    // Y-axis label
    g.append('text')
      .attr('x', -(height - margin.top - margin.bottom) / 2)
      .attr('y', -55)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '14px')
      .text('Daily CO₂ (kg)')
  }, [data])

  return (
    <div className="flex items-center justify-center overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  )
}

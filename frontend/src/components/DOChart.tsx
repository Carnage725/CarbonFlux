import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { smartDecimation } from '../lib/decimation'

interface DataPoint {
  time: string
  do_mg_l: number
}

interface Props {
  data: DataPoint[]
}

export default function DOChart({ data }: Props) {
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
    let parsedData = data.map((d) => ({
      ...d,
      parsedTime: parseTime(d.time),
    }))

    // Apply data decimation for performance (reduce to max 500 points for smaller charts)
    if (parsedData.length > 500) {
      parsedData = smartDecimation(parsedData, 500, 'do_mg_l') as typeof parsedData
    }

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.parsedTime) as [Date, Date])
      .range([0, width - margin.left - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, 12])
      .range([height - margin.top - margin.bottom, 0])

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisLeft(yScale).ticks(6)

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')

    g.append('g').call(yAxis).attr('color', '#64748b')

    // Danger zones
    // Low DO zone (< 4 mg/L)
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(4))
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale(0) - yScale(4))
      .attr('fill', '#ef4444')
      .attr('opacity', 0.1)

    // High DO zone (> 10 mg/L)
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale(10))
      .attr('fill', '#f59e0b')
      .attr('opacity', 0.1)

    // Threshold lines
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(4))
      .attr('y2', yScale(4))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.6)

    g.append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(10))
      .attr('y2', yScale(10))
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.6)

    // DO line
    const line = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => yScale(d.do_mg_l))
      .curve(d3.curveMonotoneX)

    const path = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
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
      .text('Dissolved Oxygen (DO)')

    // Y-axis label
    g.append('text')
      .attr('x', -height / 2 + margin.top)
      .attr('y', -35)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('DO (mg/L)')
  }, [data])

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

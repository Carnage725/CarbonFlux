import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  time: string
  ph: number
}

interface Props {
  data: DataPoint[]
}

export default function PHChart({ data }: Props) {
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
      .domain([6.5, 8.0])
      .range([height - margin.top - margin.bottom, 0])

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisLeft(yScale).ticks(6)

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')

    g.append('g').call(yAxis).attr('color', '#64748b')

    // Safe band shading (6.8 - 7.6)
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(7.6))
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale(6.8) - yScale(7.6))
      .attr('fill', '#10b981')
      .attr('opacity', 0.1)

    // Safe band boundaries
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(7.6))
      .attr('y2', yScale(7.6))
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5)

    g.append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(6.8))
      .attr('y2', yScale(6.8))
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5)

    // pH line
    const line = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => yScale(d.ph))
      .curve(d3.curveMonotoneX)

    const path = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#6366f1')
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
      .text('pH Level')

    // Y-axis label
    g.append('text')
      .attr('x', -height / 2 + margin.top)
      .attr('y', -35)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('pH')
  }, [data])

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

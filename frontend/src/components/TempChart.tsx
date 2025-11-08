import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { smartDecimation } from '../lib/decimation'

interface DataPoint {
  time: string
  temp_c: number
}

interface Props {
  data: DataPoint[]
}

export default function TempChart({ data }: Props) {
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
      parsedData = smartDecimation(parsedData, 500, 'temp_c') as typeof parsedData
    }

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.parsedTime) as [Date, Date])
      .range([0, width - margin.left - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([20, 32])
      .range([height - margin.top - margin.bottom, 0])

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisLeft(yScale).ticks(6)

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')

    g.append('g').call(yAxis).attr('color', '#64748b')

    // Comfort envelope shading (22-28°C)
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(28))
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale(22) - yScale(28))
      .attr('fill', '#10b981')
      .attr('opacity', 0.1)

    // Overtemp zone (> 28°C)
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale(28))
      .attr('fill', '#ef4444')
      .attr('opacity', 0.08)

    // Envelope boundaries
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(28))
      .attr('y2', yScale(28))
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5)

    g.append('line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', yScale(22))
      .attr('y2', yScale(22))
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5)

    // Temperature line
    const line = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => yScale(d.temp_c))
      .curve(d3.curveMonotoneX)

    const path = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#f97316')
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
      .text('Temperature')

    // Y-axis label
    g.append('text')
      .attr('x', -height / 2 + margin.top)
      .attr('y', -35)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('Temp (°C)')
  }, [data])

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

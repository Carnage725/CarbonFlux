import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DailyPoint {
  day: string
  total_co2_net_kg: number
}

interface Props {
  data: DailyPoint[]
}

export default function CumulativeCO2Chart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    const width = 900
    const height = 300
    const margin = { top: 20, right: 80, bottom: 60, left: 80 }

    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Calculate cumulative values
    let cumulative = 0
    const cumulativeData = data.map((d) => {
      cumulative += d.total_co2_net_kg
      return {
        day: new Date(d.day),
        cumulative,
      }
    })

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(cumulativeData, (d) => d.day) as [Date, Date])
      .range([0, width - margin.left - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(cumulativeData, (d) => d.cumulative) || 0])
      .nice()
      .range([height - margin.top - margin.bottom, 0])

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(8)
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

    // Area under curve
    const area = d3
      .area<typeof cumulativeData[0]>()
      .x((d) => xScale(d.day))
      .y0(height - margin.top - margin.bottom)
      .y1((d) => yScale(d.cumulative))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(cumulativeData)
      .attr('fill', '#10b981')
      .attr('opacity', 0.2)
      .attr('d', area)

    // Line
    const line = d3
      .line<typeof cumulativeData[0]>()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.cumulative))
      .curve(d3.curveMonotoneX)

    const path = g
      .append('path')
      .datum(cumulativeData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('d', line)

    // Animate line
    const totalLength = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0)

    // Data points
    g.selectAll('.dot')
      .data(cumulativeData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.day))
      .attr('cy', (d) => yScale(d.cumulative))
      .attr('r', 0)
      .attr('fill', '#10b981')
      .transition()
      .delay((_, i) => i * 20)
      .duration(300)
      .attr('r', 4)

    // Title
    g.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '16px')
      .attr('font-weight', '600')
      .text('Cumulative Net CO₂ Captured')

    // Y-axis label
    g.append('text')
      .attr('x', -(height - margin.top - margin.bottom) / 2)
      .attr('y', -55)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '14px')
      .text('Total CO₂ Captured (kg)')

    // Final value annotation
    const lastPoint = cumulativeData[cumulativeData.length - 1]
    if (lastPoint) {
      g.append('text')
        .attr('x', xScale(lastPoint.day))
        .attr('y', yScale(lastPoint.cumulative) - 15)
        .attr('text-anchor', 'end')
        .attr('fill', '#10b981')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(`${lastPoint.cumulative.toFixed(0)} kg`)
    }
  }, [data])

  return (
    <div className="flex items-center justify-center overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  )
}

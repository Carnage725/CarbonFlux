import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Props {
  heatLossKw: number
  totalCapacity: number
}

export default function HeatLossDonut({ heatLossKw, totalCapacity }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = 200
    const height = 200
    const radius = 80

    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Calculate loss percentage
    const lossPercent = (heatLossKw / (totalCapacity * 100)) * 100 // Rough estimate

    const data = [
      { label: 'Loss', value: lossPercent, color: '#ef4444' },
      { label: 'Retained', value: 100 - lossPercent, color: '#10b981' },
    ]

    const pie = d3.pie<typeof data[0]>().value((d) => d.value)
    const arc = d3.arc().innerRadius(radius - 30).outerRadius(radius)

    const arcs = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')

    arcs
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d) => d.data.color)
      .attr('opacity', 0.8)
      .transition()
      .duration(800)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
        return (t) => arc(interpolate(t) as any) as string
      })

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('font-size', 24)
      .attr('font-weight', 700)
      .attr('fill', '#ef4444')
      .text(`${heatLossKw.toFixed(1)}`)

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('font-size', 14)
      .attr('fill', '#94a3b8')
      .text('kW loss')
  }, [heatLossKw, totalCapacity])

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Props {
  soc: number // 0-100 percentage
  socMwh: number
  capacity: number
}

export default function SOCGauge({ soc, socMwh, capacity }: Props) {
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

    // Background arc
    const backgroundArc = d3
      .arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(2 * Math.PI)

    g.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', '#1e293b')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2)

    // Color based on SOC
    let color = '#10b981' // Green >60%
    if (soc < 30) color = '#ef4444' // Red <30%
    else if (soc < 60) color = '#f59e0b' // Amber 30-60%

    // Foreground arc (animated)
    const foregroundArc = d3
      .arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(0)

    const path = g
      .append('path')
      .attr('fill', color)
      .attr('opacity', 0.9)

    // Animate the arc
    path
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .attrTween('d', () => {
        const interpolate = d3.interpolate(0, (soc / 100) * 2 * Math.PI)
        return (t: number) => {
          return foregroundArc.endAngle(interpolate(t))(null as any) as string
        }
      })

    // Center text - SOC percentage
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-size', 32)
      .attr('font-weight', 700)
      .attr('fill', color)
      .text(`${soc.toFixed(0)}%`)

    // Subtitle - MWh
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('font-size', 14)
      .attr('fill', '#94a3b8')
      .text(`${socMwh.toFixed(2)} / ${capacity} MWh`)
  }, [soc, socMwh, capacity])

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

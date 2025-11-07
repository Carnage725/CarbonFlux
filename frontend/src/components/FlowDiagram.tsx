import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface FlowData {
  solar: number
  charge: number
  discharge: number
  load: number
}

interface Props {
  data: FlowData
}

export default function FlowDiagram({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = 800
    const height = 300
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    svg.selectAll('*').remove()

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Node positions
    const nodes = [
      { id: 'solar', x: 100, y: height / 2 - 40, label: 'Solar', value: data.solar },
      { id: 'salt', x: 400, y: height / 2 - 40, label: 'Salt Storage', value: 0 },
      { id: 'load', x: 700, y: height / 2 - 40, label: 'Algae Load', value: data.load },
    ]

    // Links (flows)
    const links = [
      { source: nodes[0], target: nodes[1], value: data.charge, color: '#10b981' }, // Solar → Salt
      { source: nodes[1], target: nodes[2], value: data.discharge, color: '#3b82f6' }, // Salt → Load
    ]

    // Draw links as curved paths
    links.forEach((link) => {
      const path = g
        .append('path')
        .attr('d', () => {
          const x1 = link.source.x + 60
          const y1 = link.source.y + 30
          const x2 = link.target.x - 60
          const y2 = link.target.y + 30
          const mx = (x1 + x2) / 2
          return `M${x1},${y1} Q${mx},${y1} ${mx},${(y1 + y2) / 2} T${x2},${y2}`
        })
        .attr('stroke', link.color)
        .attr('stroke-width', 0)
        .attr('fill', 'none')
        .attr('opacity', 0.6)

      // Animate stroke width
      path
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('stroke-width', Math.max(2, link.value / 50))
    })

    // Draw nodes
    nodes.forEach((node) => {
      const nodeG = g.append('g').attr('transform', `translate(${node.x},${node.y})`)

      nodeG
        .append('rect')
        .attr('width', 120)
        .attr('height', 60)
        .attr('rx', 8)
        .attr('fill', '#1e293b')
        .attr('stroke', '#475569')
        .attr('stroke-width', 2)

      nodeG
        .append('text')
        .attr('x', 60)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e2e8f0')
        .attr('font-size', 14)
        .attr('font-weight', 600)
        .text(node.label)

      if (node.value > 0) {
        nodeG
          .append('text')
          .attr('x', 60)
          .attr('y', 45)
          .attr('text-anchor', 'middle')
          .attr('fill', '#10b981')
          .attr('font-size', 12)
          .text(`${node.value.toFixed(0)} kW`)
      }
    })
  }, [data])

  return (
    <div className="flex items-center justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}

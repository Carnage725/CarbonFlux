import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  time: string
  temp_hot_c: number
  temp_cold_c: number
  soc_mwh: number
}

interface Props {
  data: DataPoint[]
  dispatchEvents?: { time: string; charge_kw: number; discharge_kw: number }[]
}

export default function ThermalChart({ data, dispatchEvents = [] }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    const width = 900
    const height = 400
    const margin = { top: 20, right: 80, bottom: 40, left: 60 }

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

    const yTempScale = d3
      .scaleLinear()
      .domain([280, 600])
      .range([height - margin.top - margin.bottom, 0])

    const ySOCScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([height - margin.top - margin.bottom, 0])

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(8)
    const yTempAxis = d3.axisLeft(yTempScale).ticks(6)
    const ySOCAxis = d3.axisRight(ySOCScale).ticks(6)

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis)
      .attr('color', '#64748b')

    g.append('g').call(yTempAxis).attr('color', '#64748b')

    g.append('g')
      .attr('transform', `translate(${width - margin.left - margin.right},0)`)
      .call(ySOCAxis)
      .attr('color', '#64748b')

    // Axis labels
    g.append('text')
      .attr('x', -height / 2 + margin.top)
      .attr('y', -40)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .text('Temperature (°C)')

    g.append('text')
      .attr('x', width - margin.left - margin.right + 50)
      .attr('y', height / 2)
      .attr('transform', `rotate(90, ${width - margin.left - margin.right + 50}, ${height / 2})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .text('SOC (MWh)')

    // Dispatch event stripes
    dispatchEvents.forEach((event) => {
      const eventTime = parseTime(event.time)
      const x = xScale(eventTime)

      if (event.charge_kw > 0) {
        g.append('rect')
          .attr('x', x - 2)
          .attr('y', 0)
          .attr('width', 4)
          .attr('height', height - margin.top - margin.bottom)
          .attr('fill', '#10b981')
          .attr('opacity', 0.2)
      }

      if (event.discharge_kw > 0) {
        g.append('rect')
          .attr('x', x - 2)
          .attr('y', 0)
          .attr('width', 4)
          .attr('height', height - margin.top - margin.bottom)
          .attr('fill', '#3b82f6')
          .attr('opacity', 0.2)
      }
    })

    // Temperature lines
    const hotLine = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => yTempScale(d.temp_hot_c))
      .curve(d3.curveMonotoneX)

    const coldLine = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => yTempScale(d.temp_cold_c))
      .curve(d3.curveMonotoneX)

    const socLine = d3
      .line<typeof parsedData[0]>()
      .x((d) => xScale(d.parsedTime))
      .y((d) => ySOCScale(d.soc_mwh))
      .curve(d3.curveMonotoneX)

    // Draw lines
    const hotPath = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#f97316')
      .attr('stroke-width', 2)
      .attr('d', hotLine)

    const coldPath = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', coldLine)

    const socPath = g
      .append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('opacity', 0.7)
      .attr('stroke-dasharray', '5,5')
      .attr('d', socLine)

    // Animate lines
    const animatePath = (path: d3.Selection<SVGPathElement, any, null, undefined>) => {
      const totalLength = path.node()?.getTotalLength() || 0
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
    }

    animatePath(hotPath)
    animatePath(coldPath)
    animatePath(socPath)

    // Legend
    const legend = g.append('g').attr('transform', `translate(${width - margin.left - margin.right - 150}, 20)`)

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#f97316')
      .attr('stroke-width', 2)

    legend.append('text').attr('x', 35).attr('y', 5).attr('fill', '#94a3b8').text('Hot Tank')

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 20)
      .attr('y2', 20)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)

    legend.append('text').attr('x', 35).attr('y', 25).attr('fill', '#94a3b8').text('Cold Tank')

    legend
      .append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 40)
      .attr('y2', 40)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5')

    legend.append('text').attr('x', 35).attr('y', 45).attr('fill', '#94a3b8').text('SOC')
  }, [data, dispatchEvents])

  return (
    <div className="flex items-center justify-center overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  )
}

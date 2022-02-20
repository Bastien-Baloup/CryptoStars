<template>
  <div id="scatter-container" />
</template>

<script setup>
import { onMounted, watch } from '@vue/runtime-core'
import * as d3 from 'd3'
import * as d3Helper from '../helpers/d3Helper'

const props = defineProps({
  data: {
    type: Array, default: () => [
      { name: 'test0', x: 0, y: 0, z: 0 },
      { name: 'test1', x: 1, y: 0, z: -1 },
      { name: 'test2', x: 0, y: 1, z: -2 },
      { name: 'test3', x: 1, y: 1, z: 1 },
      { name: 'test4', x: 0.5, y: 0.5, z: 2 },
    ]
  },
})

/**
 * Clamp number between two values
 */
const clamp = (min, num, max) => Math.min(Math.max(num, min), max)

const margin = { top: 10, right: 30, bottom: 30, left: 60 }
const width = clamp(460, 0.9 * window.innerWidth, 1800) - margin.left - margin.right
const height = clamp(400, 0.75 * window.innerHeight, 800) - margin.top - margin.bottom
let svg, gx, gy, gpoints, xScale, yScale, colorScale, xAxis, yAxis, points, delaunay

/**
 * Initialise the svg element, the different groups and the scales for the plot
 */
const setupPlot = () => {
  // Setup scales
  xScale = d3.scaleLog()
    .range([0, width])
  yScale = d3.scaleLog()
    .range([height, 0])
  colorScale = d3.scaleSymlog()
    .constant(1e-11)
    .range(['red', 'white', 'green'])
    .clamp(true)

  // Setup svg and main group
  svg = d3Helper.createSvg('#scatter-container', width, height, margin)
  // Setup axes groups
  gx = d3Helper.createGroup(svg).attr("transform", "translate(0," + height + ")")
  gy = d3Helper.createGroup(svg)
  // Setup points group
  gpoints = d3Helper.createGroup(svg)

  // call updatePlot function to do the initial fill of the plot
  updatePlot()
}

/**
 * Add or Update scales domains, axes and points
 */
const updatePlot = () => {
  // Setup scales domains
  xScale.domain([d3.min(props.data, d => d.x), d3.min([1e10, d3.max(props.data, d => d.x)])]).nice()
  yScale.domain([d3.min(props.data, d => d.y), d3.min([1e5, d3.max(props.data, d => d.y)])]).nice()
  const maxZ = d3.max(props.data, d => Math.abs(d.z))
  colorScale.domain([-maxZ / 10, 0, maxZ / 10])
  // Setup axes
  xAxis = gx.transition().duration(750).call(d3.axisBottom(xScale))
  yAxis = gy.transition().duration(750).call(d3.axisLeft(yScale))
  // Remove old points if present
  if (points) {
    points.call(exit =>
      exit.transition()
        .duration(750)
        .attr("opacity", 0)
        .remove()
    )
  }
  // Add new points to the plot
  points = d3Helper.appendScatterPoints(gpoints, props.data, xScale, yScale, colorScale, svg.transition().duration(750))
  // Setup delaunay from data
  delaunay = d3.Delaunay.from(props.data, d => xScale(d.x), d => yScale(d.y))
  // Setup the zoom, pan and delaunay
  d3Helper.addZoomPan(svg, [0.5, 20], xScale, yScale, gx, gy, points, delaunay)
}

onMounted(() => setupPlot())
watch(props, () => updatePlot())

</script>

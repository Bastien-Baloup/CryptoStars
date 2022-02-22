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
  xname: { type: String, default: 'x' },
  yname: { type: String, default: 'y' }
})

/**
 * Clamp number between two values
 */
const clamp = (min, num, max) => Math.min(Math.max(num, min), max)

let plot = {}
plot.margin = { top: 10, right: 30, bottom: 30, left: 60 }
plot.width = clamp(460, 0.9 * window.innerWidth, 1800) - plot.margin.left - plot.margin.right
plot.height = clamp(400, 0.75 * window.innerHeight, 800) - plot.margin.top - plot.margin.bottom

/**
 * Initialise the svg element, the different groups and the scales for the plot
 */
const setupPlot = () => {
  // Setup svg, main g, scales, axes g and points g
  d3Helper.setupPlot(plot)
  // call updatePlot function to do the initial fill of the plot
  updatePlot()
}

/**
 * Add or Update scales domains, axes and points
 */
const updatePlot = () => {
  // Setup scales domains
  plot.xScale.domain([d3.min(props.data, d => d.x), d3.min([1e10, d3.max(props.data, d => d.x)])]).nice()
  plot.yScale.domain([d3.min(props.data, d => d.y), d3.min([1e5, d3.max(props.data, d => d.y)])]).nice()
  const zLimit = d3.min([25, d3.max(props.data, d => Math.abs(d.z))])
  plot.colorScale.domain([-zLimit, 0, zLimit])
  // Setup axes
  plot.xAxis = plot.gx.transition().duration(750).call(d3.axisBottom(plot.xScale))
  plot.yAxis = plot.gy.transition().duration(750).call(d3.axisLeft(plot.yScale))
  // Remove old points if present
  if (plot.points) {
    plot.points.call(exit =>
      exit.transition()
        .duration(750)
        .attr("opacity", 0)
        .remove()
    )
  }
  // Add new points to the plot
  plot.points = d3Helper.appendScatterPoints(plot, props.data, plot.svg.transition().duration(750))
  // Setup the zoom, pan and delaunay
  plot.eventCatcher = d3Helper.addZoomPan(d3.select('svg'), [0.5, 20], plot)
  d3Helper.addTooltip(plot, props.xname, props.yname)
}
onMounted(() => setupPlot())
// update the plot when the props changes
watch(props, () => updatePlot())

</script>


<style lang="scss">
.tooltip {
  position: absolute;
  opacity: 0;
  background-color: #15163ac0;
  border: solid 2px;
  border-radius: 5px;
  z-index: 1;
  pointer-events: none;
  .value-list {
    list-style: none;
    text-align: left;
    padding-inline: 10px;
  }
}
</style>
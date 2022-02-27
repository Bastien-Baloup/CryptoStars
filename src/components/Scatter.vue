<template>
  <div id="scatter-container" />
</template>

<script setup>
import { onMounted, watch } from '@vue/runtime-core'
import * as d3 from 'd3'
import * as d3Helper from '../helpers/d3Helper'
import { useRouter } from 'vue-router'

const router = useRouter()

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
  yname: { type: String, default: 'y' },
  lines: { type: Boolean, default: false },
  tooltips: { type: Boolean, default: false },
  clicktotickerpage: { type: Boolean, default: false },
})


const plot = {}
plot.margin = { top: 20, right: 20, bottom: 60, left: 60 }
plot.width = window.innerWidth - plot.margin.left - plot.margin.right
plot.height = 0.8 * window.innerHeight - plot.margin.top - plot.margin.bottom

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
  plot.xScale.domain([d3.min(props.data, d => d.x), d3.max(props.data, d => d.x)])
  plot.yScale.domain([d3.min(props.data, d => d.y), d3.max(props.data, d => d.y)])
  const zLimit = d3.min([25, d3.max(props.data, d => Math.abs(d.z))])
  plot.colorScale.domain([-zLimit, 0, zLimit])
  // Setup axes
  plot.xAxis = plot.gx.transition().duration(750).call(d3.axisBottom(plot.xScale))
  plot.yAxis = plot.gy.transition().duration(750).call(d3.axisLeft(plot.yScale))

  plot.gx.select('text').text(props.xname)
  plot.gy.select('text').text(props.yname)
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
  // Add eventListeners on each points
  if (props.clicktotickerpage) { d3Helper.addPointClickEvent(plot, event => router.push({ name: 'crypto', params: { ticker: d3.select(event.target).data()[0].t } })) }
  // Add lines between points
  if (props.lines) {
    // in case of update, remove the old lines
    if (plot.lines) {
      plot.lines.transition(plot.svg.transition().duration(750)).attr("opacity", 0).remove()
    }
    plot.lines = d3Helper.addLines(plot, props.data)
  }
  // Setup the zoom, pan and delaunay
  plot.eventCatcher = d3Helper.addZoomPan(d3.select('svg'), [0.5, 20], plot)
  // Setup tooltips
  if (props.tooltips) { d3Helper.addTooltip(plot, props.xname, props.yname) }
}
// setup the plot
onMounted(() => setupPlot())
// update the plot when the props changes
watch(props, () => updatePlot())

</script>


<style lang="scss" scoped>
#scatter-container {
  position: relative;
  width: 100vw;
  min-height: 80vh;
  background: #000;
  margin-block: 1rem;
}
</style>

<style lang="scss">
.tooltip {
  position: absolute;
  opacity: 0;
  background-color: #000a;
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
.label {
  fill: #aaa;
  font-size: 1rem;
}
.tick {
  fill: #aaa;
  font-size: 0.75rem;
}
</style>
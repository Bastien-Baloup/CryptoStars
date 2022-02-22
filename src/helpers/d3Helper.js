import * as d3 from 'd3'

/**
 * @typedef {import('d3-selection').selection} Selection
 * @typedef {import('d3-transition').transition} Transition
 * @typedef {{top: Number, right: Number, bottom: Number, left: Number}} Margin
 * @typedef {{name: String, x: Number, y: Number, z: Number}} DataPoint
 * @typedef {Array<DataPoint>} Data
 */

/**
 * Add a svg element to the first element found by the selector then add a group inside
 */
export const createSvg = (selector, width, height, margin) => d3.select(selector)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

/**
 * Add a svg group to the selection
 * @param {Selection} selection an instance of d3.selection on with the group will be added
 * @returns {Selection} an instance of d3.selection containing the added group
 */
export const createGroup = (selection) => selection.append("g")

export const setupPlot = (plot) => {
  // Setup scales
  plot.xScale = d3.scaleLog()
    .range([0, plot.width])
  plot.yScale = d3.scaleLog()
    .range([plot.height, 0])
  plot.colorScale = d3.scaleSymlog()
    .constant(1e-1)
    .range(['red', 'white', 'green'])
    .clamp(true)

  // Setup svg and main group
  plot.svg = createSvg('#scatter-container', plot.width, plot.height, plot.margin)
  // Setup axes groups
  plot.gx = createGroup(plot.svg).attr("transform", "translate(0," + plot.height + ")")
  plot.gy = createGroup(plot.svg)
  // Setup points group
  plot.gpoints = createGroup(plot.svg)
}
/**
 * Add point in the selection based of the provided data and scales
 */
export const appendScatterPoints = (plot, data, transition) =>
  plot.svg.selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cx", d => plot.xScale(d.x))
    .attr("cy", d => plot.yScale(d.y))
    .attr("r", 2)
    .style("fill", d => plot.colorScale(d.z))
    .call(enter => enter.transition(transition).attr("opacity", 1))

/**
 * Setup and add zoom and pan action to the selected plot
 */
export const addZoomPan = (selection, scaleExtent, plot) => {

  let transform
  // A function that updates the plot when the user zoom
  const updateChart = (event) => {
    transform = event.transform
    // fetch updated scales
    const newX = transform.rescaleX(plot.xScale)
    const newY = transform.rescaleY(plot.yScale)
    // Update axes with updated scales
    plot.gx.call(d3.axisBottom(newX))
    plot.gy.call(d3.axisLeft(newY))
    // Update circle position
    plot.points
      .attr('cx', (d) => newX(d.x))
      .attr('cy', (d) => newY(d.y))
  }

  // Setup the zoom and pan paramettres
  const zoom = d3.zoom()
    .scaleExtent(scaleExtent)  // This control how much you can unzoom and zoom
    .extent([[0, 0], [plot.width, plot.height]])
    .on("zoom", updateChart)


  // Add an invisible rect on top of the chart area to catch pointer events and trigger the zoom
  const rect = selection.append("rect")
    .attr("width", plot.width)
    .attr("height", plot.height)
    .attr("transform", "translate(" + plot.margin.left + "," + plot.margin.top + ")")
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity)

  return rect
}

export const addTooltip = (plot, xName, yName, zName) => {
  // Setup delaunay from data
  const delaunay = d3.Delaunay.from(plot.points.data(), d => plot.xScale(d.x), d => plot.yScale(d.y))
  // Setup tooltip element
  const tooltip = d3.select(d3.select('svg').node().parentNode)
    .style("position", "relative")
    .style("width", (plot.width + plot.margin.left + plot.margin.right) + "px")
    .style("height", (plot.height + plot.margin.top + plot.margin.bottom) + "px")
    .append("div")
    .attr("class", "tooltip")
  /**
   * Generate the html content of the tooltip element
   * @param {DataPoint} data data of the closest point
   * @param {String} xName 
   * @param {String} yName 
   * @param {String} zName 
   * @returns {String} string of html for the tooltip element
   */
  const tooltipHtml = (data, xName, yName) => {
    return/*html*/`<p class="title">${data.name}</p>
    <ul class="value-list">
      <li>${xName}&nbsp;: ${data.x.toFixed(4).replace(/[.0]+$/g, "")}</li>
      <li>${yName}&nbsp;: ${data.y.toFixed(4).replace(/[.0]+$/g, "") ? data.y.toFixed(4).replace(/[.0]+$/g, "") : data.y.toFixed(6).replace(/[.0]+$/g, "")}</li>
      <li>value ${data.z >= 0 ? '+' : ''}${data.z.toFixed(4).replace(/[.0]+$/g, "") ? data.z.toFixed(4).replace(/[.0]+$/g, "") : data.z.toFixed(6).replace(/[.0]+$/g, "")}%</li>
    </ul>
    `
  }

  plot.eventCatcher.on("pointermove", event => {
    // get the current zoom transformation
    const zoomTransform = d3.zoomTransform(plot.eventCatcher.node())
    // Does the invert tranformation from the zoom to calculate the unzommed equivalent of the pointer position
    const p = zoomTransform.invert(d3.pointer(event))
    // Uses the unzommed pointer positon to find the closest point with the delaunay
    const i = delaunay.find(...p)

    const [mx, my] = d3.pointer(event)
    const xRatio = mx / plot.width
    const yRatio = my / plot.height

    // If the closest point is close enougth
    // Set a bigger radius for the closest point and normal radius for the others 
    // then raise the closest point over the others
    plot.points.attr('r', 2)
    const closest = d3.select(plot.points.nodes()[i])
    const distance = Math.hypot(p[0] - plot.xScale(closest.data()[0].x), p[1] - plot.yScale(closest.data()[0].y)) * zoomTransform.k
    if (distance < 30) {
      closest
        .attr('r', 5).raise()
      tooltip.style('opacity', '1')
        .html(tooltipHtml(closest.data()[0], xName, yName, zName))
        .style('left', `${xRatio > 0.75 ? mx - 250 : xRatio < 0.15 ? mx + 100 : mx + 80}px`)
        .style('top', `${yRatio > 0.75 ? my - 150 : yRatio < 0.15 ? my + 30 : my - 50}px`)
    } else {
      tooltip.style('opacity', '0')
    }
  })
}
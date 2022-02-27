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

/**
 * Setup the svg, g, scales and axis of the plot
 */
export const setupPlot = (plot) => {
  // Setup scales
  plot.xScale = d3.scaleLog()
    .range([0, plot.width])
  plot.yScale = d3.scaleLog()
    .range([plot.height, 0])
  plot.colorScale = d3.scaleSymlog()
    .constant(1e-1)
    .range(['#c60606', 'white', '#00b909'])
    .clamp(true)

  // Setup svg and main group
  plot.svg = createSvg('#scatter-container', plot.width, plot.height, plot.margin)
  // Setup axes groups
  plot.gx = createGroup(plot.svg).attr("transform", "translate(0," + plot.height + ")")
  plot.gy = createGroup(plot.svg)

  // Add X axis label:
  plot.gx.append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("x", plot.width + 15)
    .attr("y", 40)

  // Y axis label:
  plot.gy.append("text")
    .attr("class", "label")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -plot.margin.left + 20)
    .attr("x", -plot.margin.top + 35)

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
 * Add a path following the datapoints
 */
export const addLines = (plot, data) => {

  // create the path
  const line = plot.svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#aaa5")
    .attr("stroke-width", 3)
    .attr("opacity", 1)
    .attr(
      "d",
      d3.line()
        .curve(d3.curveCardinal.tension(0.75))
        .x(d => plot.xScale(d.x))
        .y(d => plot.yScale(d.y))
    )

  // Animate the line
  const lineLength = line.node().getTotalLength()
  line.attr("stroke-dashoffset", lineLength)
    .attr("stroke-dasharray", lineLength)
    .transition(plot.svg.transition().duration(2000))
    .attr("stroke-dashoffset", 0)

  return line
}


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
    // if there is a line, update it too
    if (plot?.lines) {
      plot.lines
        .attr(
          "d",
          d3.line()
            .curve(d3.curveCardinal.tension(0.75))
            .x(d => newX(d.x))
            .y(d => newY(d.y))
        )

      const lineLength = plot.lines.node().getTotalLength()
      plot.lines
        .attr("stroke-dasharray", lineLength)

    }

  }

  // Setup the zoom and pan paramettres
  const zoom = d3.zoom()
    .scaleExtent(scaleExtent)  // This control how much you can unzoom and zoom
    .extent([[0, 0], [plot.width, plot.height]])
    .on("zoom", updateChart)


  // Add an invisible rect on top of the chart area to catch pointer events and trigger the zoom
  const eventCatcher = selection
    .on('click', event => {
      if (event.target.tagName === 'circle') {
        event.target.dispatchEvent(new CustomEvent('customClick'))
      }
    })
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity)

  return eventCatcher
}

/**
 * Add a tooltip following the cursor showing the data from the closest point
 */
export const addTooltip = (plot, xName, yName, zName) => {
  // Setup delaunay from data
  const delaunay = d3.Delaunay.from(plot.points.data(), d => plot.xScale(d.x), d => plot.yScale(d.y))
  // Setup tooltip element
  const tooltip = d3.select(d3.select('svg').node().parentNode)
    .style("position", "relative")
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
      <li>value change&nbsp;:  ${data.z >= 0 ? '+' : ''}${data.z.toFixed(4).replace(/[.0]+$/g, "") ? data.z.toFixed(4).replace(/[.0]+$/g, "") : data.z.toFixed(6).replace(/[.0]+$/g, "")}%</li>
    </ul>
    `
  }

  // add eventListener 
  plot.eventCatcher.on("pointermove", event => {
    // get pointer coordinates
    let [mx, my] = d3.pointer(event)
    // correct the coordinates by applying the margins
    mx = mx - plot.margin.left
    my = my - plot.margin.top
    // get the current zoom transformation
    const zoomTransform = d3.zoomTransform(plot.eventCatcher.node())
    // Does the invert tranformation from the zoom to calculate the unzommed equivalent of the pointer position
    const p = zoomTransform.invert([mx, my])
    // Uses the unzommed pointer positon to find the closest point with the delaunay
    const i = delaunay.find(...p)

    const xRatio = mx / plot.width
    const yRatio = my / plot.height

    // If the closest point is close enougth
    // Set a bigger radius for the closest point and normal radius for the others
    // and make the tooltip visible
    // then raise the closest point over the others
    plot.points.attr('r', 2)
    const closest = d3.select(plot.points.nodes()[i])
    const distance = Math.hypot(p[0] - plot.xScale(closest.data()[0].x), p[1] - plot.yScale(closest.data()[0].y)) * zoomTransform.k
    if (distance < 30) {
      closest
        .attr('r', 5).raise()
      tooltip.style('opacity', '1')
        .html(tooltipHtml(closest.data()[0], xName, yName, zName))
        // Change the position of the tooltip to follow the cursor
        // and adjust it to keep the tolltip inside the plot when the cursor is close to the sides
        .style('left', `${xRatio > 0.85 ? mx - 250 : mx + 100}px`)
        .style('top', `${yRatio > 0.90 ? my - 120 : yRatio < 0.10 ? my + 30 : my - 50}px`)
    } else {
      tooltip.style('opacity', '0')
    }
  })


}
/**
 * Add an eventListener for the clicks on the dataPoints
 */
export const addPointClickEvent = (plot, eventHandler) => {
  plot.points.on('customClick', eventHandler)
}
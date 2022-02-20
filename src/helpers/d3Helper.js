import * as d3 from 'd3'

/**
 * @typedef {import('d3-selection').selection} Selection
 * @typedef {import('d3-transition').transition} Transition
 */

/**
 * Add a svg element to the first element found by the selector then add a group inside
 * @param {String} selector a valid css selector
 * @param {Number} width width of the created group
 * @param {Number} height height of the created group
 * @param {{top: Number, right: Number, bottom: Number, left: Number}} margin margins beetween the group and the border of the svg
 * @returns {Selection} an instance of d3.selection containing the svg
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
 * Add point in the selection based of the provided data and scales
 * @param {Selection} selection an instance of d3.selection in with the group containing the point will be added
 * @param {Array<{name: String, x: Number, y: Number, z: Number}>} data array of name, position and color value of each points
 * @param {Function} xScale scale function for the horizontal position of the points
 * @param {Function} yScale scale function for the vertical position of the points
 * @param {Function} colorScale scale for the color of the points
 * @param {Transition} transition an instance of d3.transition used for points appearance
 * @returns {Selection} an instance of d3.selection containing the points
 */
export const appendScatterPoints = (selection, data, xScale, yScale, colorScale, transition) =>
  selection.selectAll("dot")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 2)
    .style("fill", d => colorScale(d.z))
    .call(enter => enter.transition(transition).attr("opacity", 1))

/**
 * Setup and add zoom and pan action to the selected plot
 * @param {Selection} selection an instance of d3.selection containing the svg main group
 * @param {[Number, Number]} scaleExtent min and max zoom values
 * @param {Function} xScale scale function for the horizontal position of the points
 * @param {Function} yScale scale function for the vertical position of the points
 * @param {Selection} gx an instance of d3.selection containing the group for the horizontal axis
 * @param {Selection} gy an instance of d3.selection containing the group for the vertiical axis
 * @param {Selection} points an instance of d3.selection containing all points
 */
export const addZoomPan = (selection, scaleExtent, xScale, yScale, gx, gy, points, delaunay, width, height, margin) => {
  let transform
  // A function that updates the chart when the user zoom and thus new boundaries are available
  const updateChart = (event) => {
    transform = event.transform

    // fetch updated scales
    const newX = transform.rescaleX(xScale)
    const newY = transform.rescaleY(yScale)
    // Update axes with updated scales
    gx.call(d3.axisBottom(newX))
    gy.call(d3.axisLeft(newY))

    // Update circle position
    points
      .attr('cx', (d) => newX(d.x))
      .attr('cy', (d) => newY(d.y))
  }

  // Setup the zoom and pan paramettres
  const zoom = d3.zoom()
    .scaleExtent(scaleExtent)  // This control how much you can unzoom and zoom
    .extent([[0, 0], [width, height]])
    .on("zoom", updateChart)

  // Add an invisible rect on top of the chart area to catch pointer events and trigger the zoom and the delaunay
  selection.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity)
    .on("pointermove", event => {
      // Does the invert tranformation from the zoom to calculate the unzommed equivalent of the pointer position
      const p = transform.invert(d3.pointer(event))
      // Uses the unzommed pointer positon to find the closest point with the delaunay
      const i = delaunay.find(...p)
      // Set a bigger radius for the closest point and normal radius for the others 
      // then raise the closest point over the others
      points.attr('r', (_, j) => (i === j ? 3 : 2)).raise()
    })
}
// d3.legend.js 
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence

module.exports = {
  init : (d3, colorMap) => function(g) {
    g.each(function() {
      let g = d3.select(this)
      let items = {}
      let svg = d3.select(g.property("nearestViewportElement"))
      let legendPadding = g.attr("data-style-padding") || 5
      let lb = g.selectAll(".legend-box").data([true])
      let li = g.selectAll(".legend-items").data([true])

      lb.enter().append("rect").classed("legend-box",true)
      li.enter().append("g").classed("legend-items",true)

      items = Object.keys(colorMap).map(key => {return {
        key: key,
        color: colorMap[key]
      }})

      li.selectAll("text")
        .data(items,d => d.key)
        .call(d => d.enter().append("text"))
        .call(d => d.exit().remove())
        .attr("y", (d,i) => i+"em")
        .attr("x","1em")
        .text(d => d.key)
      
      li.selectAll("circle")
        .data(items,d => d.key)
        .call(d => d.enter().append("circle"))
        .call(d => d.exit().remove())
        .attr("cy", (d,i) => i-0.25+"em")
        .attr("cx", 0)
        .attr("r", "0.4em")
        .style("fill", d => d.color)  
      
      // Reposition and resize the box
      var lbbox = li[0][0].getBBox()  
      lb.attr("x", lbbox.x - legendPadding)
        .attr("y", lbbox.y - legendPadding)
        .attr("height", lbbox.height + 2 * legendPadding)
        .attr("width", lbbox.width + 2 * legendPadding)
    })
    return g
  }
}

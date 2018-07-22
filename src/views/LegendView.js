/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

import React from 'react';
import d3 from 'd3';

/**
 * LegendView View
 *
 * Class XXX
 */
class LegendView extends React.Component {
  componentDidMount() {
    const svg = d3.select('#legend_view > svg');

    // Draw legend
    this.__legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(10, 140)')
      .style('font-size', '12px');

    this.__tooltip = svg.append('svg:g')
      .style('visibility', 'hidden');

    this.__tooltip.append('svg:rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('height', 120)
      .attr('width', 120)
      .attr('style', 'stroke:#333;')
      .attr('fill', 'url(#checkerPattern)');

    this.__tooltipImage = this.__tooltip.append('svg:image')
      .attr('x', 1)
      .attr('y', 1)
      .attr('height', 118)
      .attr('width', 118)
      .attr('clip-path', 'url(#clipImage)');
  }

  componentWillReceiveProps(nextProps) {
    // update labels
    if (nextProps.labels != this.props.labels) {
      const d3_legend = require('../ext/d3.legend').init(d3, nextProps.labels);
      this.__legend.call(d3_legend);
    }

    // Update tooltip image
    if (nextProps.selectedEntry !== undefined && this.props.metaData) {
      const idx = nextProps.selectedEntry;
      if (idx === -1) this.__tooltip.style('visibility', 'hidden');
      else {
        const item = this.props.metaData[idx];
        if (item) {
          this.__tooltip.style('visibility', 'visible');
          this.__tooltipImage.attr('xlink:href', item.imagePath);
        }
      }
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="legend_view">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="checkerPattern"
              patternUnits="userSpaceOnUse"
              x="0" y="0" width="20" height="20"
              viewBox="0 0 10 10"
            >
              <rect x="0" y="0" width="5" height="5" fill="lightgrey"  />
              <rect x="5" y="5" width="5" height="5" fill="lightgrey"  />
            </pattern>
            <clipPath id="clipImage">
              <rect
                x="0" y="0" rx="10" ry="10"
                width="120" height="120"
              />
            </clipPath>
          </defs>
        </svg>
      </div>
    );
  }
}

export default LegendView;

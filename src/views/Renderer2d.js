/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import PropTypes from 'prop-types';

let svg;

// function that handles zooming
let tx = 0, ty = 0;
let ss = 1;
function zoomHandler() {
  tx = d3.event.translate[0];
  ty = d3.event.translate[1];
  ss = d3.event.scale;
}

// function that updates embedding
function updateEmbedding(Y, dim) {
  svg
    .selectAll('.u')
    .attr('transform', (d, i) => 'translate(' +
      ((Y[i * dim] * 7 * ss + tx) + 450) + ',' +
      ((Y[i * dim + 1] * 7 * ss + ty) + 300) + ')'
    );
}

function initView(container) {
  const rendererView = d3.select(container);
  svg = rendererView.append('svg') // svg is global
    .attr('width', '100%')
    .attr('height', '100%');
}

function drawEmbedding(data, onEntrySelect) {
  // Retrieve all data
  const g = svg.selectAll('.b')
    .data(data)
    .enter().append('g')
    .attr('class', 'u');

  // Add circle for each data point
  g.append('svg:circle')
    .attr('stroke-width', 1)
    .attr('fill', d => (d ? d['color']:'#00F'))
    .attr('stroke', d => (d ? d['color']:'#00F'))
    .attr('fill-opacity', 0.65)
    .attr('stroke-opacity', 0.9)
    .attr('opacity', 1)
    .attr('r', 6)
    .on('mouseover', d => {
      if (onEntrySelect) onEntrySelect(d.index);
    })
    .on('mouseout', () => {
      if (onEntrySelect) onEntrySelect(-1);
    });

  // Add zoom functionality to map
  const zoomListener = d3.behavior.zoom()
    .scaleExtent([0.1, 10])
    .center([0, 0])
    .on('zoom', zoomHandler);

  zoomListener(svg);
}

class Renderer2D extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.metaData != this.props.metaData) {
      drawEmbedding(nextProps.metaData, this.props.onEntrySelect);
    }
    if (nextProps.data != undefined && nextProps.data.length) {
      updateEmbedding(nextProps.data, 2);
    }
  }

  componentDidMount() {
    const container = ReactDOM.findDOMNode(this);
    initView(container);

    if (this.props.metaData != undefined) {
      drawEmbedding(this.props.metaData, this.props.onEntrySelect);
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div id="renderer_view" />; 
  }
}

Renderer2D.defaultProps = {
  metaData: [],
  data: []
};

Renderer2D.propTypes = {
  metaData: PropTypes.array,
  data: PropTypes.array
};

export default Renderer2D;

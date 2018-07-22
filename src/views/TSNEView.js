/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

import React from 'react';
import Renderer3D from './Renderer3d';
import Renderer2D from './Renderer2d';
import tsne from '../tsne';
import PropTypes from 'prop-types';

// Number of dimention for the project
// cab be 2 or 3 
const RENDER_DIM = 3;

const tsneOptions = {
  epsilon: 10, // epsilon is learning rate
  perplexity: 30, // roughly how many neighbors each point influences
  dim: RENDER_DIM // dimensionality of the embedding
};
tsne.init(tsneOptions);

/**
 * TSNEView View
 *
 * Class XXX
 */
class TSNEView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tsneData: [] };

    // setup the callback that will be used by TSNE algorithm
    // ot update the rendering
    tsneOptions.update = Y => this.setState({ tsneData: Y });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      tsne.setData(nextProps.data);
    }
  }

  render2d = () => (
    <Renderer2D
      metaData={this.props.metaData}
      data={this.state.tsneData}
      onEntrySelect={this.props.onEntrySelect}
    />
  )

  render3d = () => (
    <Renderer3D
      metaData={this.props.metaData}
      data={this.state.tsneData}
      onEntrySelect={this.props.onEntrySelect}
    />
  )

  render() {
    return (RENDER_DIM === 3) ? this.render3d() : this.render2d();
  }
}

TSNEView.defaultProps = {
  metaData: []
};

TSNEView.propTypes = {
  metaData: PropTypes.array
};

export default TSNEView;

/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

'use strict'

import React from 'react'
import Renderer3D from './renderer3d'
import Renderer2D from './renderer2d'
import tsne from '../tsne'

// Number of dimention for the project
// cab be 2 or 3 
const RENDER_DIM = 3

var tsne_options = {
  epsilon: 10, // epsilon is learning rate
  perplexity: 30, // roughly how many neighbors each point influences
  dim: RENDER_DIM // dimensionality of the embedding
}
tsne.init(tsne_options)

/**
 * TSNEView View
 *
 * Class XXX
 */
class TSNEView extends React.Component {

  constructor(props) {
    super(props)
    this.state = { tsne_data: [] }

    // setup the callback that will be used by TSNE algorithm
    // ot update the rendering
    tsne_options.update = Y => this.setState ({ tsne_data: Y })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      tsne.setData(nextProps.data)
    }
  }

  render () {
    return (RENDER_DIM === 3)?
      <Renderer3D
        meta_data={this.props.meta_data}
        data={this.state.tsne_data}
        onSelectedEntry={this.props.onSelectedEntry}
      />:
      <Renderer2D
        meta_data={this.props.meta_data}
        data={this.state.tsne_data}
        onSelectedEntry={this.props.onSelectedEntry}
      />
  }
}

export default TSNEView

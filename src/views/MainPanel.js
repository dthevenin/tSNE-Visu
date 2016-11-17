/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

'use strict'

import React from 'react';
import TSNEView from './TSNEView'
import LegendView from './LegendView'

/**
 * MainPanel View
 *
 * Class XXX
 */
class MainPanel extends React.Component {

  constructor(props) {
    super(props)
    this.state = { selectedLabel: -1 }

    this.onSelectedLabel = (idx) => this.setState ({ selectedLabel: idx })
  }

  render () {
    return <div>
      <TSNEView
        meta_data={this.props.meta_data}
        data={this.props.data}
        onSelectedLabel={this.onSelectedLabel}
      />
      <LegendView
        labels={this.props.labels}
        selectedLabel={this.state.selectedLabel}
        meta_data={this.props.meta_data}
      />
    </div>
  }
}

export default MainPanel

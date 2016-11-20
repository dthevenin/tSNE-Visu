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
    this.state = { selectedEntry: -1 }

    this.onEntrySelect = (idx) => this.setState ({ selectedEntry: idx })
  }

  render () {
    return <div>
      <TSNEView
        meta_data={this.props.meta_data}
        data={this.props.data}
        onEntrySelect={this.onEntrySelect}
      />
      <LegendView
        labels={this.props.labels}
        selectedEntry={this.state.selectedEntry}
        meta_data={this.props.meta_data}
      />
    </div>
  }
}

export default MainPanel

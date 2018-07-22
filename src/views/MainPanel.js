/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

import React from 'react';
import TSNEView from './TSNEView';
import LegendView from './LegendView';

/**
 * MainPanel View
 *
 * Class XXX
 */
class MainPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedEntry: -1 };

    this.onEntrySelect = (idx) => this.setState({ selectedEntry: idx });
  }

  render() {
    return (
      <div>
        <TSNEView
          metaData={this.props.metaData}
          data={this.props.data}
          onEntrySelect={this.onEntrySelect}
        />
        <LegendView
          labels={this.props.labels}
          selectedEntry={this.state.selectedEntry}
          metaData={this.props.metaData}
        />
      </div>
    );
  }
}

export default MainPanel;

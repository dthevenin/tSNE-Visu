/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

import { ipcRenderer } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import ColorLabel from './ColorLabel';
import MainPanel from './views/MainPanel';

/** **************************************************************
 * UI Management
 *****************************************************************/

function renderUI(metaData, data, labels) {
  ReactDOM.render(
    <MainPanel labels={labels} metaData={metaData} data={data} />,
    document.getElementById('main_window')
  );
}

renderUI();

/** **************************************************************
 * Data Management
 *****************************************************************/
const DATASET_PATH = '../../dataset/images/';

// function that executes after data is successfully loaded
function init(data) {
  const len = data.length;
  const metaData = Array.from(new Array(len), (v, i) => ({
    focus: 0,
    index: i,
    label: data[i].label,
    color: ColorLabel.getColor(data[i].label),
    imagePath: DATASET_PATH + data[i].label + '/' + data[i].imageName
  }));

  renderUI(metaData, data, ColorLabel.getColorMap());
}

ipcRenderer.on('bottlenecks', (event, data) => init(data));

setTimeout(() => ipcRenderer.send('get_bottlenecks'), 100);

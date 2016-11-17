/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

'use strict'

import {ipcRenderer} from 'electron'
import React from 'react'
import ReactDOM from 'react-dom'
import ColorLabel from "./ColorLabel"
import MainPanel from "./views/mainPanel"

/****************************************************************
 * Data Management
 *****************************************************************/
const DATASET_PATH = "../../dataset/images/"

ipcRenderer.on("bottlenecks", (event, data) => init(data))

// function that executes after data is successfully loaded
function init (data) {
  let len = data.length
  var meta_data = Array.from(new Array(len), (v, i) => {return {
    focus: 0,
    index: i,
    label: data[i].label,
    color: ColorLabel.getColor(data[i].label),
    imagePath: DATASET_PATH + data[i].label + '/' + data[i].imageName
  }})

  renderUI(meta_data, data, ColorLabel.getColorMap())
}

setTimeout(_ => ipcRenderer.send("get_bottlenecks"), 100)

/****************************************************************
 * UI Management
 *****************************************************************/

function renderUI (meta_data, data, labels) {
  ReactDOM.render(
    <MainPanel labels={labels} meta_data={meta_data} data={data}/>,
    document.getElementById('main_window')
  )
}

renderUI()

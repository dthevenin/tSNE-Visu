/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

'use strict'

const FS = require('fs');
const Path = require('path');

// Returns list of folder's names
const getDirectories = srcpath => FS.readdirSync(srcpath).filter(
  file => FS.statSync(Path.join(srcpath, file)).isDirectory()
)

var csvData = []

// Read on vector file
function readOneFile (path, label, file) {
  if (file == ".DS_Store") return
    
  let csv_file = Path.join(path, label, file)
  let content = FS.readFileSync(csv_file).toString()
  try {
    let data = JSON.parse("[" + content + "]")
    let imageName = file.replace(".txt", "")
    csvData.push({label, imageName, data})
  }
  catch (e) {
    console.log(path, label, file)
    console.log(e)
  }
}

// Read all vectors for one label
function readOneLabel (path, label) {
  let srcpath = Path.join(path, label)
  let list_csv =
    FS.readdirSync(srcpath)
      .filter(file => FS.statSync(Path.join(srcpath, file)).isFile())

  list_csv.forEach(file => readOneFile (path, label, file))
}

// Read all vectors from a path. Folder structure have to be:
// path/label_name/vector.txt
function read (path) {
  csvData.length = 0
  const labels = getDirectories(path)
  labels.forEach(label => readOneLabel(path, label))
  return csvData
}

module.exports = { read }

/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

const FS = require('fs');
const Path = require('path');

// Returns list of folder's names
const getDirectories = srcpath => FS.readdirSync(srcpath).filter(
  file => FS.statSync(Path.join(srcpath, file)).isDirectory()
);

const csvData = [];

// Read on vector file
function readOneFile(path, label, file) {
  if (file == '.DS_Store') return;

  const csvFile = Path.join(path, label, file);
  const content = FS.readFileSync(csvFile).toString();
  try {
    const data = JSON.parse(`[${content}]`);
    const imageName = file.replace('.txt', '');
    csvData.push({ label, imageName, data });
  }
  catch (e) {
    console.log(path, label, file);
    console.log(e);
  }
}

// Read all vectors for one label
function readOneLabel(path, label) {
  const srcpath = Path.join(path, label);
  const listCsv =
    FS.readdirSync(srcpath)
      .filter(file => FS.statSync(Path.join(srcpath, file)).isFile());

  listCsv.forEach(file => readOneFile(path, label, file));
}

// Read all vectors from a path. Folder structure have to be:
// path/label_name/vector.txt
function read(path) {
  csvData.length = 0;
  const labels = getDirectories(path);
  labels.forEach(label => readOneLabel(path, label));
  return csvData;
}

module.exports = { read };

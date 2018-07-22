/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import readBottleneck from './readTensors';

/** **************************************************************
 * App's life Management
 *****************************************************************/

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const contents = mainWindow.webContents;
  contents.on('did-finish-load', () => console.log('App did finish load'));
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

/** **************************************************************
 * Data Management
 *****************************************************************/

function getBottlenecks() {
  const contents = mainWindow.webContents;
  const data = readBottleneck.read('./dataset/vectors/');
  contents.send('bottlenecks', data);
}

ipcMain.on('get_bottlenecks', getBottlenecks);

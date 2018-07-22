/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

const worker = new Worker('../tsne-workers.js');

/** **************************************************************
 *  Javascript method interface to the TSNE worker
 *****************************************************************/

let options;

const init = _options => {
  options = _options;
  worker.postMessage({ msg: 'init', data: {} });
};

const setData = data => {
  worker.postMessage({ msg: 'setData', data });
};

// function that changes the perplexity and restarts t-SNE
const setPerplexity = data => {
  worker.postMessage({ msg: 'setPerplexity', data });
};

/** **************************************************************
 *    Worker event listening
 *****************************************************************/

worker.addEventListener('message', e => {
  const data = e.data;
  switch (data.msg) {
    case 'update':
      if (options.update) options.update(data.solution, data.dim);
      break;
    default:
      console.log(`Unknown command: ${data}`);
  }
}, false);

module.exports = { init, setData, setPerplexity };

/**
 *
 * This software is the property of David Thevenin.
 * Copyright (C) 2016. David Thevenin, All rights reserved
 *
 * Contributors:
 *      David Thevenin <david.thevenin@gmail.com>
 */

/* global importScripts tsnejs */

importScripts('./ext/tsne.js');

// t-SNE.js object and other global variables
let stepCounter = 0;
const maxCounter = 500;
let runner;
let tsne;
let options;
let dists;

// function that computes pairwise distances
function computeDistances(data) {
  const len = data.length;
  const len2 = len * len;
  const dim = data[0].data.length;

  // initialize distance matrix
  const dists = new Float32Array(len2);

  let i, j, d;
  let max_dist = 0.0;
  // compute pairwise distances
  // (and find the maximum distance)
  for (i = 0; i < len; i++) {
    for (j = i + 1; j < len; j++) {
      let t_dist = 0.0;
      for (d = 0; d < dim; d++) {
        t_dist += Math.pow(data[i].data[d] - data[j].data[d], 2);
      }
      const sqrt_dist = Math.sqrt(t_dist);
      dists[i * len + j] = sqrt_dist;
      dists[j * len + i] = sqrt_dist;
      if (sqrt_dist > max_dist) max_dist = sqrt_dist;
    }
  }

  // normalize distances to prevent numerical issues
  i = len2;
  while (i--) dists[i] /= max_dist;

  return dists;
}

// perform single t-SNE iteration
function step() {
  stepCounter++;
  if (stepCounter <= maxCounter) tsne.step();
  else clearInterval(runner);

  const solution = tsne.getSolution();
  const dim = options.dim || 2;
  // self.postMessage({msg:'update', solution:solution, dim: dim }, [solution])
  self.postMessage({ msg: 'update', solution, dim });
}

function setData(data) {
  // encode Array into TypedArray
  data.forEach(line => line.data = new Float32Array(line.data));
  dists = computeDistances(data);
  tsne.initDataDist(dists, data.length);

  // schedule a tsne iteration
  runner = setInterval(step, 0);
}

function init(_options) {
  options = _options;
  tsne = new tsnejs.tSNE(options);
}

// function that changes the perplexity and restarts t-SNE
function setPerplexity(p) {
  options.epsilon = p;
  tsne = new tsnejs.tSNE(options);
  tsne.initDataDist(dists);

  stepCounter = 0;
  clearInterval(runner);
  runner = setInterval(step, 0);
}

/** **************************************************************
 *    Worker event listening
 *****************************************************************/

self.addEventListener('message', e => {
  const call = e.data;
  switch (call.msg) {
    case 'setData':
      setData(call.data);
      break;
    case 'init':
      init(call.data);
      break;
    case 'setPerplexity':
      setPerplexity(call.data);
      break;
    default:
      self.postMessage(`Unknown command: ${call.msg}`);
  }
}, false);

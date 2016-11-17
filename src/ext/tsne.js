// create main global object
var tsnejs = tsnejs || { REVISION: 'ALPHA' };

(function(global) {
  "use strict";

  // utility function
  var assert = function(condition, message) {
    if (!condition) { throw message || "Assertion failed"; }
  }

  // syntax sugar
  var getopt = function(opt, field, defaultval) {
    if(opt.hasOwnProperty(field)) {
      return opt[field];
    } else {
      return defaultval;
    }
  }

  // return 0 mean unit standard deviation random number
  var return_v = false;
  var v_val = 0.0;
  var gaussRandom = function() {
    if(return_v) { 
      return_v = false;
      return v_val; 
    }
    var u = 2*Math.random()-1;
    var v = 2*Math.random()-1;
    var r = u*u + v*v;
    if(r == 0 || r > 1) return gaussRandom();
    var c = Math.sqrt(-2*Math.log(r)/r);
    v_val = v*c; // cache this for next function call for efficiency
    return_v = true;
    return u*c;
  }

  // return random normal number
  var randn = function(mu, std){ return mu+gaussRandom()*std; }

  // utilitity that creates contiguous vector of zeros of size n
  var zeros = function(n) {
    if(typeof(n)==='undefined' || isNaN(n)) { return []; }
    if(typeof ArrayBuffer === 'undefined') {
      // lacking browser support
      var arr = new Array(n);
      for(var i=0;i<n;i++) arr[i]= 0
      return arr;
    } else {
      return new Float32Array(n); // typed arrays are faster
    }
  }

  // utility that returns 2d array filled with random numbers
  // or with value s, if provided
  var randn2d = function(n, d, s) {
    var uses = typeof s !== 'undefined';
    var x = zeros(n * d);
    var i, j
    for (i = 0; i < n; i++) {
      for (j = 0; j < d; j++) { 
        x[i * d + j] = (uses)?s:randn(0.0, 1e-4)
      }
    }
    return x;
  }

  // compute L2 distance between two vectors
  var L2 = function(x1, x2) {
    var D = x1.length;
    var d = 0;
    for(var i=0;i<D;i++) { 
      var x1i = x1[i];
      var x2i = x2[i];
      d += (x1i-x2i)*(x1i-x2i);
    }
    return d;
  }

  // compute pairwise distance in all vectors in X
  var xtod = function(X) {
    var N = X.length;
    var dist = zeros(N * N); // allocate contiguous array
    for(var i=0;i<N;i++) {
      for(var j=i+1;j<N;j++) {
        var d = L2(X[i], X[j]);
        dist[i*N+j] = d;
        dist[j*N+i] = d;
      }
    }
    return dist;
  }

  // compute (p_{i|j} + p_{j|i})/(2n)
  var d2p = function(D, perplexity, tol) {
    var Nf = Math.sqrt(D.length); // this better be an integer
    var N = Math.floor(Nf);
    assert(N === Nf, "D should have square number of elements.");
    var Htarget = Math.log(perplexity); // target entropy of distribution
    var P = zeros(N * N); // temporary probability matrix

    var prow = zeros(N); // a temporary storage compartment
    for(var i=0;i<N;i++) {
      var betamin = -Infinity;
      var betamax = Infinity;
      var beta = 1; // initial value of precision
      var done = false;
      var maxtries = 50;

      // perform binary search to find a suitable precision beta
      // so that the entropy of the distribution is appropriate
      var num = 0;
      while(!done) {
        //debugger;

        // compute entropy and kernel row with beta precision
        var psum = 0.0;
        for(var j=0;j<N;j++) {
          var pj = Math.exp(- D[i*N+j] * beta);
          if(i===j) { pj = 0; } // we dont care about diagonals
          prow[j] = pj;
          psum += pj;
        }
        // normalize p and compute entropy
        var Hhere = 0.0;
        for(var j=0;j<N;j++) {
          if(psum == 0) {
             var pj = 0;
          } else {
             var pj = prow[j] / psum;
          }
          prow[j] = pj;
          if(pj > 1e-7) Hhere -= pj * Math.log(pj);
        }

        // adjust beta based on result
        if(Hhere > Htarget) {
          // entropy was too high (distribution too diffuse)
          // so we need to increase the precision for more peaky distribution
          betamin = beta; // move up the bounds
          if(betamax === Infinity) { beta = beta * 2; }
          else { beta = (beta + betamax) / 2; }

        } else {
          // converse case. make distrubtion less peaky
          betamax = beta;
          if(betamin === -Infinity) { beta = beta / 2; }
          else { beta = (beta + betamin) / 2; }
        }

        // stopping conditions: too many tries or got a good precision
        num++;
        if(Math.abs(Hhere - Htarget) < tol) { done = true; }
        if(num >= maxtries) { done = true; }
      }

      // console.log('data point ' + i + ' gets precision ' + beta + ' after ' + num + ' binary search steps.');
      // copy over the final prow to P at row i
      for(var j=0;j<N;j++) { P[i*N+j] = prow[j]; }

    } // end loop over examples i

    // symmetrize P and normalize it to sum to 1 over all ij
    var Pout = zeros(N * N);
    var N2 = N*2;
    for(var i=0;i<N;i++) {
      for(var j=0;j<N;j++) {
        Pout[i*N+j] = Math.max((P[i*N+j] + P[j*N+i])/N2, 1e-100);
      }
    }

    return Pout;
  }

  // helper function
  function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

  var tSNE = function(opt) {
    var opt = opt || {};
    this.perplexity = getopt(opt, "perplexity", 30); // effective number of nearest neighbors
    this.dim = getopt(opt, "dim", 2); // by default 2-D tSNE
    this.epsilon = getopt(opt, "epsilon", 10); // learning rate

    this.iter = 0;
  }

  tSNE.prototype = {

    // this function takes a set of high-dimensional points
    // and creates matrix P from them using gaussian kernel
    initDataRaw: function(X) {
      var N = X.length;
      var D = X[0].length;
      assert(N > 0, " X is empty? You must have some data!");
      assert(D > 0, " X[0] is empty? Where is the data?");
      var dists = xtod(X); // convert X to distances using gaussian kernel
      this.P = d2p(dists, this.perplexity, 1e-4); // attach to object
      this.N = N; // back up the size of the dataset
      this.initSolution(); // refresh this
    },

    // this function takes a given distance matrix and creates
    // matrix P from them.
    // D is assumed to be provided as a list of lists, and should be symmetric
    initDataDist: function(D, N) {
      assert(N > 0, " X is empty? You must have some data!");
      // convert D to a (fast) typed array version
      var dists = zeros(N * N); // allocate contiguous array
      for(var i=0;i<N;i++) {
        for(var j=i+1;j<N;j++) {
          var d = D[i*N+j];
          dists[i*N+j] = d;
          dists[j*N+i] = d;
        }
      }
      this.P = d2p(dists, this.perplexity, 1e-4);
      this.N = N;
      this.initSolution(); // refresh this
    },

    // (re)initializes the solution to random
    initSolution: function() {
      // generate random solution to t-SNE
      this.Y = randn2d(this.N, this.dim); // the solution
      this.gains = randn2d(this.N, this.dim, 1.0); // step gains to accelerate progress in unchanging directions
      this.ystep = randn2d(this.N, this.dim, 0.0); // momentum accumulator
      this.iter = 0;

      let NN = this.N * this.N

      this.__Qu = zeros(NN)
      this.__Q = zeros(NN)
      this.__grad = zeros(this.N * this.dim)
    },

    // return pointer to current solution
    getSolution: function() {
      return this.Y;
    },

    // perform a single step of optimization to improve the embedding
    step: function() {
      var i, j, d
      this.iter += 1;
      var N = this.N;

      var cost = this.costGrad(); // evaluate gradient
      // var cost = cg.cost;
      var grad = this.__grad;

      // perform gradient step
      var dim = this.dim
      var ymean = zeros(dim);
      var Y = this.Y
      var idx
      for (i = 0; i < N; i++) {
        for (d = 0; d < dim; d++) {
          var gid = grad[i * dim + d];
          idx = i * dim + d
          var sid = this.ystep[idx];
          var gainid = this.gains[idx];

          // compute gain update
          var newgain = sign(gid) === sign(sid) ? gainid * 0.8 : gainid + 0.2;
          if(newgain < 0.01) newgain = 0.01; // clamp
          this.gains[idx] = newgain; // store for next turn

          // compute momentum step direction
          var momval = this.iter < 250 ? 0.5 : 0.8;
          var newsid = momval * sid - this.epsilon * newgain * gid;
          this.ystep[idx] = newsid; // remember the step we took

          // step!
          Y[idx] += newsid; 

          ymean[d] += Y[idx]; // accumulate mean so that we can center later
        }
      }

      // reproject Y to be zero mean
      for(i = 0; i < N; i++) {
        for(d = 0; d < dim; d++) {
          Y[i * dim + d] -= ymean[d]/N;
        }
      }

      //if(this.iter%100===0) console.log('iter ' + this.iter + ', cost: ' + cost);
      return cost; // return current cost
    },

    // for debugging: gradient check
    debugGrad: function() {
      var N = this.N;

      var cost = this.costGrad(); // evaluate gradient
      var grad = this.__grad;

      var e = 1e-5;
      for(var i=0;i<N;i++) {
        for(var d=0;d<this.dim;d++) {
          var yold = this.Y[i * dim + d];

          this.Y[i * dim + d] = yold + e;
          var cg0_cost = this.costGrad();

          this.Y[i * dim + d] = yold - e;
          var cg1_cost = this.costGrad();
          
          var analytic = grad[i * dim + d];
          var numerical = (cg0_cost - cg1_cost) / ( 2 * e );
          console.log(i + ',' + d + ': gradcheck analytic: ' + analytic + ' vs. numerical: ' + numerical);

          this.Y[i * dim + d] = yold;
        }
      }
    },

    // return cost and gradient, given an arrangement
    costGrad: function() {
      var N = this.N;
      var dim = this.dim; // dim of output space
      var P = this.P;
      var i, j, d, qu

      var pmul = this.iter < 100 ? 4 : 1; // trick that helps with local optima

      var Y = this.Y
      // compute current Q distribution, unnormalized first
      var Qu = this.__Qu;
      var qsum = 0.0;
      var dsum
      for (i = 0; i < N; i++) {
        for (j = i + 1; j < N; j++) {
          dsum = 0.0;
          for (d = 0; d < dim; d++) {
            var dhere = Y[i * dim + d] - Y[j * dim + d];
            dsum += dhere * dhere;
          }
          qu = 1.0 / (1.0 + dsum); // Student t-distribution
          Qu[i*N+j] = qu;
          Qu[j*N+i] = qu;
          qsum += 2 * qu;
        }
      }
      // normalize Q distribution to sum to 1
      var NN = N*N;
      var Q = this.__Q;
      for (var q = 0; q < NN; q++) Q[q] = Math.max(Qu[q] / qsum, 1e-100);

      var cost = 0.0
      var grad = this.__grad
      var idx
      grad.fill(0.0)
      for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {
          idx = i * N + j
          cost += - P[idx] * Math.log(Q[idx]); // accumulate cost (the non-constant portion at least...)
          var premult = 4 * (pmul * P[idx] - Q[idx]) * Qu[idx];
          for (d = 0; d < dim; d++) {
            grad[i * dim + d] += premult * (Y[i * dim + d] - Y[j * dim + d]);
          }
        }
      }

      return cost;
    }
  }

  global.tSNE = tSNE; // export tSNE class
})(tsnejs);


// export the library to window, or to module in nodejs
(function(lib) {
  "use strict";
  if (typeof module === "undefined" || typeof module.exports === "undefined") {
    if (typeof window != "undefined") window.tsnejs = lib; // in ordinary browser attach library to window
  } else {
    module.exports = lib; // in nodejs
  }
})(tsnejs);

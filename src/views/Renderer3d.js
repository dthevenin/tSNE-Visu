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
import ReactDOM from 'react-dom'

const THREE = require("three")
const Stats = require("stats-js")
require("../ext/TrackballControls")

let scene, camera, renderer
let stats, container, particles
let HEIGHT, WIDTH
let raycaster, intersects
let mouse, INTERSECTED
let controls

// function that updates embedding
function updateEmbedding (Y, dim) {
  particles.geometry.vertices.forEach((vertex, i) => {
    vertex.x = Y[i * dim] //* 20
    vertex.y = Y[i * dim + 1] //* 20
    vertex.z = Y[i * dim + 2] //* 20
  })
  particles.geometry.verticesNeedUpdate = true
}

let meta_data
function drawEmbedding (_meta_data) {
  meta_data = _meta_data

  let geometry1 = new THREE.BoxGeometry(200, 200, 200, 20, 20, 20)
  let vertices = geometry1.vertices
  let positions = new Float32Array(meta_data.length * 3)

  let geometry = new THREE.Geometry()
  for (let i = 0, l = meta_data.length; i < l; i ++ ) {
    let vertex = vertices[i]
    geometry.vertices.push(vertex)

    var data = meta_data[i]
    let color = new THREE.Color(data.color)
    geometry.colors.push(color)
  }

  let sprite = new THREE.TextureLoader().load("../assets/disc.png")
  let material = new THREE.PointsMaterial( {
    size: 12,
    sizeAttenuation: false,
    map: sprite,
    alphaTest: 0.5,
    transparent: true,
    vertexColors: THREE.VertexColors
  })

  particles = new THREE.Points(geometry, material)

  scene.add(particles)

  animate()
}

function initView (container, onEntrySelect) {
  HEIGHT = container.offsetHeight
  WIDTH = container.offsetWidth

  let fieldOfView = 75
  let aspectRatio = WIDTH / HEIGHT
  let nearPlane = 1
  let farPlane = 3000

  let cameraZ = 50
  let fogHex = 0x000000 /* As black as your heart. */
  let fogDensity = 0.0007 /* So not terribly dense?  */

  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
  camera.position.z = cameraZ

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(fogHex, fogDensity)
  scene.background = new THREE.Color(0xffffff)

  renderer = new THREE.WebGLRenderer() /*  Rendererererers particles.  */
  renderer.setPixelRatio(window.devicePixelRatio) /* Probably 1; unless you're fancy.  */
  renderer.setSize(WIDTH, HEIGHT) /* Full screen baby Wooooo!  */

  container.appendChild(renderer.domElement) /* Let's add all this crazy junk to the page. */

  stats = new Stats()
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.top = '0px'
  stats.domElement.style.right = '0px'
  container.appendChild(stats.domElement)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  /* Event Listeners */
  controls = new THREE.TrackballControls( camera )

  controls.rotateSpeed = 2.0
  controls.zoomSpeed = 1.2
  controls.panSpeed = 0.8

  controls.noZoom = false
  controls.noPan = false

  controls.staticMoving = true
  controls.dynamicDampingFactor = 0.3

  controls.keys = [ 65, 83, 68 ]

  controls.addEventListener( 'change', render )

  window.addEventListener('resize', onWindowResize, false)
  container.addEventListener('mousedown', onMouseDown, false)
  container.addEventListener('mouseup', onMouseUp, false)
  container.addEventListener('mousemove', onMouseMove, false)

  var MODE = 0
  function onMouseMove (event) {
    if (!particles) return
      
    mouse.x = (event.clientX / WIDTH) * 2 - 1
    mouse.y = - (event.clientY / HEIGHT) * 2 + 1

    switch (MODE) {
      case 0: // info mode

        var geometry = particles.geometry
        var attributes = geometry.attributes

        raycaster.setFromCamera(mouse, camera)

        intersects = raycaster.intersectObject(particles)

        if (intersects.length > 0) {
          INTERSECTED = intersects[0]
          var data = meta_data[INTERSECTED.index]
          if (onEntrySelect) onEntrySelect(INTERSECTED.index)
        }
        else if (INTERSECTED) {
          if (onEntrySelect) onEntrySelect(-1)
          INTERSECTED = null
        }
      break
    }
  }

  function onMouseUp (event) { MODE = 0 }

  function onMouseDown (event) {
    MODE = 1
    if (INTERSECTED) {
      if (onEntrySelect) onEntrySelect(-1)
      INTERSECTED = null
    }
  }
}

function onWindowResize () {
  WIDTH = container.offsetWidth
  HEIGHT = container.offsetHeight

  camera.aspect = WIDTH / HEIGHT
  camera.updateProjectionMatrix()
  renderer.setSize(WIDTH, HEIGHT)
}

function animate () {
  requestAnimationFrame(animate)
  render()
  stats.update()
  controls.update()
}

function render () {
  renderer.render(scene, camera)
}

class Renderer3D extends React.Component {

  componentWillReceiveProps (nextProps) {
    if (nextProps.meta_data != this.props.meta_data) {
      drawEmbedding(nextProps.meta_data)
    }
    if (nextProps.data != undefined) {
      updateEmbedding(nextProps.data, 3)
    }
  }

  componentDidMount () {
    container = ReactDOM.findDOMNode(this)
    initView(container, this.props.onEntrySelect)

    if (this.props.meta_data != undefined) {
      drawEmbedding(this.props.meta_data)
    }
  }

  shouldComponentUpdate () { return false }

  render () { return <div id="renderer_view"></div> }
}

export default Renderer3D

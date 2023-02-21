<template>
  <div>
    <canvas id="c1"></canvas>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

let stats;
let scene, renderer, camera, canvas;
let mesh;

let increment=0;

const debug = false;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );

  canvas = document.getElementById("c1");
  renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setClearColor(0x123456);

  camera.position.set(0,0,200);
  camera.lookAt( scene.position );

  stats = new Stats();
  if (debug) document.body.appendChild( stats.dom );

  const material = new THREE.MeshNormalMaterial();
  const geometry = new THREE.SphereGeometry(10, 32, 32);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();
  if (renderer.info.render.frame == 180 && debug == true) console.log(renderer.info.render);

  // fix with scrollama offset: scrollVal.value goes from 0.1 to 0.9
  increment += 0.01;

  mesh.position.x = 100 * Math.cos(increment);
  mesh.position.y = 100 * Math.sin(increment);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight ;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onMounted(() => {
  window.addEventListener("resize", onWindowResize);
  init();
  animate();
})

</script>
<template>
  <div>
    <div>
      <canvas :id="props.id"></canvas>
    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

let stats;
let scene, renderer, camera, canvas; 
let plane, plane2, plane3;

const reqID = useState('reqID');
const signals = useState('signals');
const debug = true;

let rmsForwardFactor = 0;
let rmsBackwardFactor = 0;
let rmsThreshold = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );

  canvas = document.getElementById(props.id);
  renderer = new THREE.WebGLRenderer({ antialias : true, canvas, alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setClearColor(0x000000, 1.);

  camera.position.set(0,0,1000);
  camera.lookAt( scene.position );

  stats = new Stats();
  if (debug) {
    stats.domElement.classList.add('debug');
    stats.domElement.id = 'stats';
    stats.domElement.style.cssText = 'position:absolute;top:400px;left:80px;';
    document.body.appendChild(stats.domElement);
  }
  
  const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
  const planeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    blending:THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vec3 pos = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        vec2 st = vUv;
        st = st * 2. - 1.;
        vec3 col = vec3(1.);
        float t = 0.007; // thickness
        float smoothFactor = 0.003;
        col = mix(vec3(0.), vec3(1.), 1. - smoothstep(0.75, 0.75 + smoothFactor, length( abs(st) )));
        col = mix(col, vec3(0.), 1. - smoothstep(0.75 - t, 0.75 - t + smoothFactor,length( abs(st) )));

        float alpha = 1. - smoothstep(0.75, 0.75 + smoothFactor,length( abs(st) )) ;

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane2 = plane.clone();
  plane3 = plane.clone();
  scene.add(plane, plane2, plane3);

  if (debug) {
    const effectController = {
      rmsForwardFactor: 0.8,
      rmsBackwardFactor: 1.2,
      rmsThreshold: 0.009
    };
    const matChanger = function ( ) {
      rmsForwardFactor = effectController.rmsForwardFactor;
      rmsBackwardFactor = effectController.rmsBackwardFactor;
      rmsThreshold = effectController.rmsThreshold;
    }
    const gui = new GUI();
    gui.domElement.id = 'gui';
    gui.add( effectController, 'rmsForwardFactor', 0, 3, 0.001 ).onChange( matChanger );
    gui.add( effectController, 'rmsBackwardFactor', 0, 3, 0.001 ).onChange( matChanger );
    gui.add( effectController, 'rmsThreshold', 0, 0.01, 0.0001 ).onChange( matChanger );
    matChanger();
  }

}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  const time = performance.now() * 0.001;

  if (signals.value.rms != undefined && signals.value.rms > rmsThreshold) {
    plane.rotation.x += Math.pow(signals.value.rms, rmsForwardFactor);
    plane2.rotation.y += Math.pow(signals.value.rms, rmsForwardFactor);
  } else if (signals.value.rms != undefined && signals.value.rms > 0.) {
    plane.rotation.x -= Math.pow(signals.value.rms, rmsBackwardFactor);
    plane2.rotation.y -= Math.pow(signals.value.rms, rmsBackwardFactor);
  }
    else {
    plane.rotation.x = 0.0;
    plane2.rotation.y = 0.0;
  }

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight ;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onMounted(() => {

  if (reqID.value != undefined && reqID.value != 0) {
    cancelAnimationFrame(reqID.value);

    if (document.getElementById("stats") != undefined) {
      const stats = document.getElementById("stats");
      const gui = document.getElementById("gui");
      stats.remove();
      gui.remove();
    }

  }
  
  window.addEventListener("resize", onWindowResize);
  init();
  animate();
  
})

</script>
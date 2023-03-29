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

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

let stats;
let scene, renderer, camera, canvas, mesh, controls; 
let plane, plane2, plane3;

const reqID = useState('reqID');
const signals = useState('signals');
const debug = false;

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
  if (debug) document.body.appendChild( stats.dom );
  
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
}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  const time = performance.now() * 0.001;

  if (signals.value.rms != undefined && signals.value.rms > 0.0037) {
    plane.rotation.x += Math.pow(signals.value.rms, 1.1);
    plane2.rotation.y += Math.pow(signals.value.rms, 1.1);
  } else if (signals.value.rms != undefined && signals.value.rms > 0.) {
    plane.rotation.x -= Math.pow(signals.value.rms, 0.9);
    plane2.rotation.y -= Math.pow(signals.value.rms, 0.9);
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
  }
  
  window.addEventListener("resize", onWindowResize);
  init();
  animate();
  
})

</script>
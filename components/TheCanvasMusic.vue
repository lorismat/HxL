<template>
  <div>
    <canvas id="c1"></canvas>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import * as Tone from 'tone';

// tonejs 
// all package

let stats;
let scene, renderer, camera, canvas;
let mesh;

const debug = false;

const frequencyArraySize = useState('frequencyArraySize');
const analyserDCMeter = useState('analyserDCMeter');
const analyserMeter = useState('analyserMeter');
const analyserFourier = useState('analyserFourier');

let minArray = [0];

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

  camera.position.set(0,0,1000);
  camera.lookAt( scene.position );

  // add controls
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.maxDistance = 2000;
  // controls.minDistance = 1000;

  // number of lines depends on frequency
  // check what we can get as information

  stats = new Stats();
  if (debug) document.body.appendChild( stats.dom );

  // to improve
  const arrSize = 82;

  // create shader material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2() },
      fArray: { value: new Float32Array(frequencyArraySize.value) }

    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vec3 pos = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 resolution;
      uniform float fArray[${arrSize}];
      

      float plot(vec2 st, float pct){
        return  smoothstep( pct-0.1, pct, st.y) -
                smoothstep( pct, pct+0.1, st.y);
      }


      varying vec2 vUv;
      void main() {

        vec2 st = vUv;
        vec2 store = vUv;

        float size = float(${arrSize});
        st.y = fract(st.y * size);

        // float y = sin(st.x * 2. * 3.14 + 0.1 * fArray[ int(floor(store.y * size)) ] ) * 4. / 10. + 0.5;
        // float y = sin(st.x * 2. * 3.14 * 100. + time * 2.) * 4. / 10. + 0.5;
        // float y = sin(st.x * 2. * 3.14 * 10. * abs( fArray[ int(floor(store.y * size)) ]  ) + time * 2.) * 4. / 10. + 0.5;

        float y = sin(st.x * 4. * 3.14 * 10. + time * 8.) * abs( fArray[ int(floor(store.y * size)) ] * 100.  ) * 0.00008 * 4. / 10. + 0.5;
    
        float pct = plot(st,y);
        
        vec3 col = vec3(1.);
        col = (1.0-pct)*col+pct*vec3(0.071,0.204,0.337);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  // update shader material
  mesh.material.uniforms.time.value = performance.now() / 1000;
  mesh.material.uniforms.resolution.value.x = renderer.domElement.width;
  mesh.material.uniforms.resolution.value.y = renderer.domElement.height;


  if (analyserFourier.value != undefined) {

    const fArray = analyserFourier.value.getValue();
    minArray = [];

    for (let i = 0; i < fArray.length; i += 100) {
      minArray.push(fArray[i]);
    }

    console.log(minArray.length);

    mesh.material.uniforms.fArray.value = minArray;

    mesh.rotation.x += 0.001;
    mesh.rotation.y += 0.001;
    mesh.rotation.z += 0.001;

    // mesh.scale.x += analyserDCMeter.value.getValue();
    // mesh.scale.y = Math.abs(analyserMeter.value.getValue());
    // mesh.scale.z = Math.abs(analyserFourier.value.getValue()[0]);
  }

  // if frame 200
  if (renderer.info.render.frame == 200 && debug == true) {
    console.log(mesh.material.uniforms.fArray.value);
  }

  if (renderer.info.render.frame == 400 && debug == true) {
    console.log(mesh.material.uniforms.fArray.value);
  }


  
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
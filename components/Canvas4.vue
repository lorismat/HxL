<template>
  <div>
    <canvas :id="props.id"></canvas>
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
let scene, renderer, camera, canvas, mesh;

const reqID = useState('reqID');
const signals = useState('signals');
const debug = true;

let rmsFactor = 0;
let energyFactor = 0;
let perceptualSpreadFactor = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );

  canvas = document.getElementById(props.id);
  renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
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

  const material = new THREE.ShaderMaterial({
    uniforms: {
      rms: { value: 0.0 },
      energy: { value: 0.0 },
      perceptualSpread: { value: 0.0 },
      clean: { value: 0.0 },
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
      uniform float clean;
      uniform float rms;
      uniform float zcr;
      uniform float energy;
      uniform float perceptualSpread;

      varying vec2 vUv;

      float random (vec2 st) {
          return fract(sin(dot(st.xy,
                              vec2(12.9808,78.233)))*
              43758.5453123);
      }

      vec2 random2(vec2 st){
          st = vec2( dot(st,vec2(127.1,311.7)),
                    dot(st,vec2(269.5,183.3)) );
          return -1.0 + 2.0*fract(sin(st)*43758.5453123);
      }

      float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          vec2 u = f*f*(3.0-2.0*f);
          return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                          dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                      mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                          dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
      }

      void main() {

        vec2 st = vUv;
        st = st * 2. - 1.;

        float t = 0.007;
        float smoothFactor = 0.003;
        float r = 0.75;

        vec3 col = vec3(1.);
    
        col = mix(vec3(0.), vec3(1.), 1. - smoothstep(perceptualSpread, perceptualSpread + smoothFactor, length( abs(st) )));
        col = mix(col, vec3(0.), 1. - smoothstep(perceptualSpread - t, perceptualSpread - t + smoothFactor, length( abs(st) )));

        col = mix(col, vec3(1.), 1. - smoothstep(rms, rms + smoothFactor, length( abs(st * 0.6 + vec2(noise(st * pow(rms,2.)) * 0.1) ) )));
        col = mix(col, vec3(0.), 1. - smoothstep(rms - t, rms - t + smoothFactor, length( abs(st * 0.6 + vec2(noise(st * pow(rms,2.)) * 0.1) ) )));

        col = mix(col, vec3(1.), 1. - smoothstep(energy, energy + smoothFactor, length( abs(st * 0.75 + vec2(noise(st * 10.) * 0.01) ) )));
        col = mix(col, vec3(0.), 1. - smoothstep(energy - t, energy - t + smoothFactor, length( abs(st * 0.75 + vec2(noise(st * 10.) * 0.01) ) )));

        rms == 0. ? col = mix(vec3(0.), vec3(1.), 1. - smoothstep(r, r + smoothFactor, length( abs(st) ))) : col = col;
        rms == 0. ?  col = mix(col, vec3(0.), 1. - smoothstep(r - t, r - t + smoothFactor, length( abs(st) ))) : col = col;
       
        gl_FragColor = vec4(col, 1.);
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(1000, 1000, 32, 32);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  if (debug) {
    const effectController = {
      rmsFactor: 1.,
      energyFactor: 4,
      perceptualSpreadFactor: 0.9,
    };
    const matChanger = function ( ) {
      rmsFactor = effectController.rmsFactor;
      energyFactor = effectController.energyFactor;
      perceptualSpreadFactor = effectController.perceptualSpreadFactor;
    }
    const gui = new GUI();
    gui.domElement.id = 'gui';
    gui.add( effectController, 'rmsFactor', 0, 3, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'energyFactor', 0, 5, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'perceptualSpreadFactor', 0, 1, 0.01 ).onChange( matChanger );
    matChanger();
  }
  
}

function animate() {
  reqID.value = requestAnimationFrame(animate);

  renderer.render(scene, camera);
  stats.update();

  if (signals.value.rms != undefined && signals.value.rms > 0) {
    mesh.material.uniforms.rms.value = signals.value.rms * rmsFactor;
    mesh.material.uniforms.energy.value = signals.value.energy * energyFactor;
    mesh.material.uniforms.perceptualSpread.value = signals.value.perceptualSpread * perceptualSpreadFactor;

    mesh.material.uniforms.clean.value = 1.;
  } else {
    mesh.material.uniforms.rms.value = 0.0;
    mesh.material.uniforms.energy.value = 0.0;
    mesh.material.uniforms.perceptualSpread.value = 0.75;

    mesh.material.uniforms.clean.value = 0.;
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
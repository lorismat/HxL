<template>
  <div>
    <canvas :id="props.id"></canvas>
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
let scene, renderer, camera, canvas, mesh;

const reqID = useState('reqID');


const signals = useState('signals');
const debug = false;

// incrementing frequencies and init array
let inc = [0, 0, 0];

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
  if (debug) document.body.appendChild( stats.dom );

  const material = new THREE.ShaderMaterial({
    uniforms: {
      fArray: { value: new Float32Array(signals.value.arrSize) },
      u_f0: { value: 0.0 },
      u_f1: { value: 0.0 },
      u_f2: { value: 0.0 }
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
      uniform float fArray[${signals.value.arrSize}];
      varying vec2 vUv;
      uniform float u_f0;
      uniform float u_f1;
      uniform float u_f2;

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
        vec3 col = vec3(1.);

        float t = 0.007; // thickness
        float smoothFactor = 0.003;

        float r = 0.75;

        float val = fArray[0];
        float val2 = fArray[1];
        float val3 = fArray[2];

        // remap fArray from 0 to 22050 to 0 to 1
        val = val / 22050.0;
        val2 = val2 / 22050.0;
        val3 = val3 / 22050.0;

        val = 0.4 + clamp(0. , 0.39, abs(noise(st/100. + u_f0 * 0.01 ) ));
        val2 = 0.5 + clamp(0. , 0.49, abs(noise(st/100. + u_f1 * 0.01 ) ));
        val3 = 0.6 + clamp(0., 0.39, abs(noise(st/100. + u_f2 * 0.01 ) ));

        col = mix(col, vec3(0.0), smoothstep(val, val + smoothFactor, length( abs(st) )));
        col = mix(col, vec3(1.0), smoothstep(val + t, val + smoothFactor + t, length( abs(st) )));

        col = mix(col, vec3(0.0), smoothstep(val2, val2 + smoothFactor, length( abs(st) )));
        col = mix(col, vec3(1.0), smoothstep(val2 + t, val2 + smoothFactor + t, length( abs(st) )));

        col = mix(col, vec3(0.0), smoothstep(val3, val3 + smoothFactor, length( abs(st) )));
        col = mix(col, vec3(1.0), smoothstep(val3 + t, val3 + smoothFactor + t, length( abs(st) )));

        col = 1. - col;

      fArray[0] + fArray[1] + fArray[2] == 0. ? col = mix(vec3(0.), vec3(1.), 1. - smoothstep(r, r + smoothFactor, length( abs(st) ))) : col = col;
      fArray[0] + fArray[1] + fArray[2] == 0. ? col = mix(col, vec3(0.), 1. - smoothstep(r - t, r - t + smoothFactor, length( abs(st) ))) : col = col;

        gl_FragColor = vec4(col, 1.);
      }
    `,
  });

  // plane geometry with threejs
  const geometry = new THREE.PlaneGeometry(1000, 1000, 32, 32);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  if (signals.value.rms != undefined && signals.value.rms > 0) {
    const fArray = signals.value.powerSpectrum;
    for (let i = 0; i < fArray.length; i++) {
      fArray[i] = Math.abs(fArray[i]);
      if (fArray[i] > 100) {
        inc[i] += 2;
      } else if (fArray[i] > 0.5) {
        inc[i] += 0.1;
      } else if (fArray[i] == 0) {
        inc[i] = 0.75;
      }
    }

    mesh.material.uniforms.fArray.value = fArray;
    mesh.material.uniforms.u_f0.value = inc[0];
    mesh.material.uniforms.u_f1.value = inc[1];
    mesh.material.uniforms.u_f2.value = inc[2];
  } else {
    const fArray = [];
    for (let i = 0; i < signals.value.arrSize; i++) {
      fArray.push(0);
    }
    console.log(fArray);
    mesh.material.uniforms.fArray.value = fArray;
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
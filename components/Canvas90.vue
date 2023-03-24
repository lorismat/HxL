<template>
  <div>
    <div>
      <canvas :id="props.id"></canvas>
    </div>

    <div class="container-description">
      <div class="description">
        <div>rms</div>
        <div>energy</div>
        <div>spectralSpread</div>
      </div>
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
let scene, renderer, camera, canvas, mesh;

let rArrLength = 0;
let rmsArr = [0];

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
      rms: { value: 0.0 },
      zcr: { value: 0.0 },
      energy: { value: 0.0 },
      perceptualSpread: { value: 0.0 },
      spectralSpread: { value: 0.0 },
      rArrLength: { value: 0.0 },
      rArray: { value: new Float32Array(rmsArr.length) },
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
    
      uniform float rms;
      uniform float zcr;
      uniform float energy;
      uniform float perceptualSpread;
      uniform float spectralSpread;
      varying vec2 vUv;
      uniform float rArrLength;

      uniform float rArray[${rmsArr.length}];

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

      float circle(vec2 st, vec2 coords, float r) {
        return step(r, length(st - coords));
      }

      void main() {

        vec2 st = vUv;
        vec2 store = vUv;

        store.y *= 3.;

        // float size = float(${rArrLength});
        // st.y = fract(st.y * 3.);
        // st = st * 2. - 1.;

        vec3 col = vec3(1.);
    
        float t = 0.007; // thickness
        float smoothFactor = 0.003;

        // float rVal = rArray[int(store.y * size)];
        // float arr[5] = float[](1.0, 2.0, 10., 3., 5.);
        // col = mix(vec3(0.), vec3(1.), circle(st, vec2(random(vec2(floor(rArray[int(store.y * size)])))), 0.01 ));
        // col = mix(vec3(0.), vec3(1.), circle(store, vec2(random(vec2(floor(arr[int(store.y * 5.)])))), 0.01 ));

        float arr[3] = float[](0.1, 0.2, 0.3);

        // col = mix(vec3(0.), vec3(1.), circle(st, vec2(random(vec2(arr[int(floor(store.y * 10.)) ] ))), 0.1 ));

        col = mix(vec3(0.), vec3(1.), circle(st, vec2(1.), 0.1 ));

        gl_FragColor = vec4(col, 1.);
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(1000, 1000, 32, 32);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  if (signals.value.rms != undefined && signals.value.rms > 0) {
    mesh.material.uniforms.rms.value = signals.value.rms / 1.;
    mesh.material.uniforms.zcr.value = signals.value.zcr / 100.;
    mesh.material.uniforms.energy.value = signals.value.energy / 100.;
    mesh.material.uniforms.perceptualSpread.value = signals.value.perceptualSpread / 10.;
    mesh.material.uniforms.spectralSpread.value = signals.value.spectralSpread / 255.;

    if (signals.value.rms > 0.02) {
      rmsArr.push(signals.value.rms);
      mesh.material.uniforms.rArrLength.value = rmsArr.length;
      mesh.material.uniforms.rArray.value = rmsArr;
      
    } 


  } else {
    mesh.material.uniforms.rms.value = 0.0;
    mesh.material.uniforms.zcr.value = 0.0;
    mesh.material.uniforms.energy.value = 0.75;
    mesh.material.uniforms.perceptualSpread.value = 0.0;
    mesh.material.uniforms.spectralSpread.value = 0.0;
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
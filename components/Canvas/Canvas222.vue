<template>
  <canvas :id="props.canvasId"></canvas>
</template>

<script setup>
import * as THREE from 'three';


const props = defineProps({
  canvasId: {
    type: String,
    default: `canvas-2`
  }
})

let scene, renderer, camera, canvas, mesh;

const reqId = useState('reqId');
const signals = useState('signals');
const cellSize = useState('cellSize');

let spectralSpreadFactor = 16;

function init() {

  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    1,
    1,
    3000
  );

  canvas = document.getElementById(props.canvasId);
  renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
  renderer.setPixelRatio( window.devicePixelRatio );
  
  // to fix: with size of cells
  renderer.setSize( cellSize.value - 70, cellSize.value - 70);

  renderer.setClearColor(0x000000, 1.);
  camera.position.set(0,0,1000);
  camera.lookAt( scene.position );

  const geometry = new THREE.PlaneGeometry(1000, 1000, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      spectralSpread: { value: 0.0 },
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
      uniform float spectralSpread;
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
        vec3 col = vec3(1.);
    
        float t = 0.007;
        float smoothFactor = 0.003;

        float val = 0.75 + noise(st + spectralSpread) * spectralSpread;
        spectralSpread == 0.75 ? val = 0.75 : val = val;
        
        col = mix(vec3(0.), vec3(1.), 1. - smoothstep(val, val + smoothFactor, length( abs(st) )));
        col = mix(col, vec3(0.), 1. - smoothstep(val - t, val - t + smoothFactor, length( abs(st) )));

        gl_FragColor = vec4(col, 1.);
      }
    `,
  })
  
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer.render(scene, camera);
}

function animate() {
  reqId.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);


  if (signals.value != undefined 
      && signals.value.id == props.canvasId
      && signals.value.rms > 0) {

    // specific
    mesh.material.uniforms.spectralSpread.value = signals.value.spectralSpread * spectralSpreadFactor;
  } else {
    mesh.material.uniforms.spectralSpread.value = 0.75;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight ;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onMounted(() => {
  init();
  canvasSize('small', canvas);  
})

watch(() => signals.value.id, (newValue, oldValue) => {
  canvasSize('small', canvas);

  if (reqId.value != undefined && reqId.value != 0) {
    cancelAnimationFrame(reqId.value);
  }
  init();

  if (signals.value.id == props.canvasId) {
    setTimeout(() => {
      canvasSize('big', canvas, renderer, camera);
      animate();
    }, 0);
  }
})

watch(() => cellSize.value, (newValue, oldValue) => {
  init();

})



/*
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
*/

</script>
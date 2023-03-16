<template>
  <div>
    <canvas :id="props.id"></canvas>
  </div>
</template>

<script setup>

// about render targets
// https://threejs.org/manual/#en/rendertargets
// https://threejs.org/docs/#api/en/renderers/WebGLRenderTarget
// model:
// https://experiments.p5aholic.me/day/027/

import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

let camera, scene, renderer, canvas, stats;
let mesh, pivot;

const signals = useState('signals');

const debug = false;

const frustumSize = 1000;

let inc = 0;

function init() {
  scene = new THREE.Scene();

  // add orthographic camera
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );

  canvas = document.getElementById(props.id);

  renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1.);

  const count = 32;
  const radius = 270;
  const geometry = new THREE.CircleGeometry( radius, 128 );

  const arrSize = signals.value.arrSize;
  
  // add shader material
  const material = new THREE.ShaderMaterial( {
    uniforms: {
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      fArray: { value: new Float32Array(arrSize) },
      u_time: { value: 0.0 },

    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      uniform vec2 resolution;
      uniform float fArray[${arrSize}];
      uniform float u_time;
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

        float val = fArray[ 0 ];
        float radius = 0.99;

        vec3 color = vec3(1.0);
        vec2 center = vec2(0.5, 0.5);
        float thickness = 0.01 * sin(val * 0.02 * st.x + u_time ) * noise(st) * 2.;
        float smoothing = 0.01;
        color *= smoothstep(radius - thickness - smoothing, radius - thickness, length( abs(st)));
        gl_FragColor = vec4(color,1.0);
      }
    `,
    side: THREE.DoubleSide,
  } );

  const matrix = new THREE.Matrix4();
  mesh = new THREE.InstancedMesh( geometry, material, count );

  for ( let i = 0; i < count; i ++ ) {
    //matrix.makeRotationX( i * 0.04 );
    mesh.setMatrixAt( i, matrix );
  }
  
  scene.add( mesh );

  camera.position.set(0,0,1000);
  camera.lookAt( scene.position );

  stats = new Stats();
  if (debug) document.body.appendChild( stats.dom );
  
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;
  inc += 0.001;
  
  if (signals.value.rms != undefined && signals.value.powerSpectrum[0] > 0) {  
    
    // update instance matrix
    const matrix = new THREE.Matrix4();
    for ( let i = 0; i < 32; i ++ ) {

      if (i == 0 && signals.value.powerSpectrum[0] > 500) {
        mesh.material.uniforms.fArray.value = signals.value.powerSpectrum;
        mesh.material.uniforms.u_time.value = time;
      } 
      if (i != 0) {
        matrix.makeRotationX( i * 0.04 + inc );
      }
      
      mesh.setMatrixAt( i, matrix );
    }
    mesh.instanceMatrix.needsUpdate = true;

  }
  
  renderer.render(scene, camera);

  // update frame stats
  stats.update();

}

function onWindowResize() {

  const aspect = window.innerWidth / window.innerHeight;
  camera.left = - frustumSize * aspect / 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = - frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

}

onMounted(() => {
  window.addEventListener("resize", onWindowResize);
  init();
  animate();
})

</script>
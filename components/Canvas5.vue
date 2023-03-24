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
let scene, renderer, camera, canvas, mesh;

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

  const chromaArrSize = 24;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      rms: { value: 0.0 },
      cArray: { value: new Float32Array(chromaArrSize) },
      u_time: { value: 0.0 },
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

      uniform float u_time;
      uniform float rms;
      uniform float cArray[${chromaArrSize}];

      varying vec2 vUv;

      float smoothFactor = 0.003;

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

        vec2 store = vUv;
        vec2 st = vUv;
        vec2 coord = vUv;
        float r = 0.75;
        
        store = store * 2. - 1.;
        vec3 col = vec3(1.);

        float size = float(${chromaArrSize});
        st.y = fract(st.y * size);
      
        float t = 0.007; // thickness
        
        float c = cArray[int(coord.y * size)];

        col = mix(
          vec3(0.), 
          vec3(1.), 
          smoothstep(0.52 + sin(st.x * c * 10. + u_time * 1.2 + c * 2.) * 0.45, 0.55 + sin(st.x * c * 10. + u_time * 1.2 + c * 2.) * 0.45, st.y) 
          + 1. - smoothstep(0.44 + sin(st.x * c * 10. + u_time * 1.2 + c * 2.) * 0.45, 0.47 + sin(st.x * c * 10. + u_time * 1.2 + c * 2.) * 0.45, st.y)
        );

        col = 1.-col;

        col = mix(col, vec3(1.), smoothstep(r - t, r - t + smoothFactor,length( abs(store) )));
        col = mix(col, vec3(0.), smoothstep(r, r + smoothFactor, length( abs(store) )));

        // tap
        rms == 0. ? col = mix(vec3(0.), vec3(1.), 1. - smoothstep(r, r + smoothFactor, length( abs(store) ))) : col = col;
        rms == 0. ?  col = mix(col, vec3(0.), 1. - smoothstep(r - t, r - t + smoothFactor, length( abs(store) ))) : col = col;

        gl_FragColor = vec4(col, 1.);
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  // add time uniform
  const time = performance.now() * 0.001;
  mesh.material.uniforms.u_time.value = time;

  if (signals.value.rms != undefined) {
    const chroma = signals.value.chroma;
    mesh.material.uniforms.cArray.value = chroma;
    console.log(chroma);
    mesh.material.uniforms.rms.value = signals.value.rms;
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
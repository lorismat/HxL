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
let scene, renderer, camera, canvas, mesh, plane;

const reqID = useState('reqID');
const signals = useState('signals');
const debug = true;

let rmsFactor = 0;

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

  const material = new THREE.ShaderMaterial({
    transparent:true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthTest: false,
    uniforms: {
      rms: { value: 0.0 },
      u_time: { value: 0.0 },
    },
    vertexShader: `
      uniform float u_time;
      uniform float rms;
      varying vec2 vUv;
      varying vec3 v_position;

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
        vec3 pos = position;
        v_position = position;
        vUv = uv;
        pos.z += noise(pos.xy / 200. + rms) * 300.;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 v_position;
      uniform float u_time;
      uniform float rms;
      
      void main() {
        float dist = length(v_position.xy - vec2(0.));
        vec3 col = vec3(1.);
        col *= smoothstep(0.685,0.69, dist * 0.003);
        col *= smoothstep(0.885,0.89, dist * 0.003); 
        float alpha = 0.;

        rms == 0. ? alpha = 0. : alpha = smoothstep(v_position.z * 0.001, v_position.z * 0.009, 2.5);

        gl_FragColor = vec4(col, alpha);
      }
    `
  });

  const geometry = new THREE.SphereGeometry(500, 128*2, 128*2);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      rms: { value: 0.0 },
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
      varying vec2 vUv;

      void main() {
        vec2 st = vUv;
        st = st * 2. - 1.;
        vec3 col = vec3(1.);
        float t = 0.007;
        float smoothFactor = 0.003;
        col = mix(vec3(0.), vec3(1.), 1. - smoothstep(0.75, 0.75 + smoothFactor, length( abs(st) )));
        col = mix(col, vec3(0.), 1. - smoothstep(0.75 - t, 0.75 - t + smoothFactor,length( abs(st) )));

        rms == 0. ? col = col : col = vec3(0.);

        gl_FragColor = vec4(col, 1.);
      }
    `,
  });
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  if (debug) {
    const effectController = {
      rmsFactor: 0.2,
    };
    const matChanger = function ( ) {
      rmsFactor = effectController.rmsFactor;
    }
    const gui = new GUI();
    gui.domElement.id = 'gui';
    gui.add( effectController, 'rmsFactor', 0, 4, 0.001 ).onChange( matChanger );
    matChanger();
  }

  
}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  const time = performance.now() * 0.001;

  if (signals.value.rms != undefined && signals.value.rms > 0) {
    mesh.material.uniforms.rms.value += signals.value.rms * rmsFactor;
    mesh.material.uniforms.u_time.value = time;

    plane.material.uniforms.rms.value += signals.value.rms * rmsFactor;
  } else {
    mesh.material.uniforms.rms.value = 0.;
    plane.material.uniforms.rms.value = 0.;
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
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
let scene, renderer, camera, canvas, mesh;

const reqID = useState('reqID');
const signals = useState('signals');
const debug = true;

let rmsFactor = 0;
let zcrFactor = 0;
let energyFactor = 0;

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
      zcr: { value: 0.0 },
      energy: { value: 0.0 },
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
      uniform float zcr;
      uniform float energy;
      varying vec2 vUv;

      float sdCircle( in vec2 p, in float r ) {
        return length(p) - r;
      }

      float smin(float a, float b, float k) {
        float h = max(k - abs(a-b), 0.) / k;
        return min(a, b) - h*h*h*k*1./6.;
      }

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

        float pix = 0.001;

        vec2 st = vUv;
        st = st * 2. - 1.;

        vec3 col = vec3(1.);
    
        float t = 0.007;
        float smoothFactor = 0.003;

        float r = 0.75 * 0.5;

        vec2 p = st;
        vec2 m = st;
          
        float f = 0.04 * 0.5;

        float border = 0.009 * 0.5;

        float d = sdCircle(p, 0.75*0.5);

        float dd = sdCircle(
          m + vec2(noise(st * 0.1 + u_time + rms) * 0.5) + vec2( sin(u_time * 20. * f + zcr) * 0.3, cos(u_time * 20. * f + zcr) * 0.3),
          0.3*0.5 + energy
        );

        col = mix(col, vec3(0.), smoothstep(-0.001,0., smin(d,dd,0.1) - border ));
        col = mix(col, vec3(0.), smoothstep(0.,-0.001, smin(d,dd,0.1) - border/8. ));

        rms == 0. ? col = mix(vec3(0.), vec3(1.), 1. - smoothstep(r, r + smoothFactor, length( abs(st) ))) : col = col;
        rms == 0. ?  col = mix(col, vec3(0.), 1. - smoothstep(r - t*0.5, r - t*0.5 + smoothFactor, length( abs(st) ))) : col = col;
        
        gl_FragColor = vec4(col, 1.);
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(2000, 2000, 32, 32);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  if (debug) {
    const effectController = {
      rmsFactor: 0.8,
      zcrFactor: 0.1,
      energyFactor: 0.2
    };
    const matChanger = function ( ) {
      rmsFactor = effectController.rmsFactor;
      zcrFactor = effectController.zcrFactor;
      energyFactor = effectController.energyFactor;
    }
    const gui = new GUI();
    gui.domElement.id = 'gui';
    gui.add( effectController, 'rmsFactor', 0, 10, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'zcrFactor', 0, 10, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'energyFactor', 0, 10, 0.01 ).onChange( matChanger );
    matChanger();
  }
  
}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  const time = performance.now() * 0.001;

  if (signals.value.rms != undefined && signals.value.rms > 0) {
    mesh.material.uniforms.u_time.value = time;
    mesh.material.uniforms.rms.value = signals.value.rms * rmsFactor;
    mesh.material.uniforms.zcr.value = signals.value.zcr * zcrFactor;
    mesh.material.uniforms.energy.value = signals.value.energy * energyFactor;
  } else {
    mesh.material.uniforms.rms.value = 0.0;
    mesh.material.uniforms.zcr.value = 0.0;
    mesh.material.uniforms.energy.value = 0.75;
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
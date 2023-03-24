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
let inc= 0;
let inc2 = 0;
let inc3 = 0;

const signals = useState('signals');

const debug = false;

let minArray = [0];

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

  // to improve
  const arrSize = signals.value.arrSize;

  // create shader material
  const material = new THREE.ShaderMaterial({
    transparent:true,
    side: THREE.DoubleSide,
    uniforms: {
      fArray: { value: new Float32Array(arrSize) },
      u_resolution: { value: 0.0},
      u_time: { value: 0.0 },
      u_inc: { value: 0.0 },
      u_inc2: { value: 0.0 },
      u_inc3: { value: 0.0 }
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
      uniform float fArray[${arrSize}];
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 vUv;
      uniform float u_inc;
      uniform float u_inc2;
      uniform float u_inc3;

      float sdCircle( in vec2 p, in float r ) {
        return length(p) - r;
      }

      float smin(float a, float b, float k) {
        float h = max(k - abs(a-b), 0.) / k;
        return min(a, b) - h*h*h*k*1./6.;
      }

      // add noise 
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
      // Gradient Noise by Inigo Quilez - iq/2013
      // https://www.shadertoy.com/view/XdXGW8
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
        vec2 st = vec2(0.5) - vUv;

        vec2 p = st * 2.0;
        vec2 m = st * 2.0;
          
        float f = 0.05;

        float border = 0.02;
        float d = sdCircle(p,0.4);

        float dd = sdCircle(
          m + vec2(sin(u_time*30.*f + 1.)*0.5,sin(u_time*30.*f + noise(st*2.) * 1.)*0.5),
          0.1
        );

        float ddd = sdCircle(
          m + vec2(cos(u_time*30.*f + 20.)*0.5,cos(u_time*30.*f + noise(st*2. + 10.) * 1.)*0.5),
          0.1
        );

        vec3 col = vec3(1.);

        col = mix(col, vec3(0.), smoothstep(-pix,pix, smin(d,dd,0.1) - border ));
        col = mix(col, vec3(0.), smoothstep(pix,-pix, smin(d,dd,0.1) - border/4. ));

        //col = mix(col, vec3(0.), smoothstep(-pix,pix, smin(d,ddd,0.3) - border ));
        //col = mix(col, vec3(0.), smoothstep(pix,-pix, smin(d,ddd,0.3) - border/2. ));
      
        // FragCoord
        gl_FragColor = vec4(col, 1.);
      }
    `,
  });

  // plane geometry with threejs
  const geometry = new THREE.PlaneGeometry(1500, 1500, 32, 32);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  // add time uniform
  const time = performance.now() / 1000;
  mesh.material.uniforms.u_time.value = time;
  mesh.material.uniforms.u_resolution.value = [window.innerWidth, window.innerHeight];

  if (signals.value.powerSpectrum != undefined) {

    const fArray = signals.value.powerSpectrum;
    minArray = [];

    for (let i = 0; i < fArray.length; i += 1) {
      minArray.push(fArray[i]);
    }

    if (minArray[0] > 100) {
      inc+=2;
    } else if (minArray[0] > 0.1) {
      inc+=0.1;
    }

    if (minArray[1] > 100) {
      inc2+=2;
    } else if (minArray[1] > 0.1) {
      inc2+=0.1;
    }

    if (minArray[2] > 100) {
      inc3+=2;
    } else if (minArray[2] > 0.1) {
      inc3+=0.1;
    }

    mesh.material.uniforms.fArray.value = minArray;
    mesh.material.uniforms.u_inc.value = inc;
    mesh.material.uniforms.u_inc2.value = inc2;
    mesh.material.uniforms.u_inc3.value = inc3;

   
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
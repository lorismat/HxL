<template>
  <div>
    <canvas id="c1"></canvas>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

  canvas = document.getElementById("c1");
  renderer = new THREE.WebGLRenderer({ antialias : true, canvas, alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setClearColor(0xffffff, 1.);

  camera.position.set(0,0,300);
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
      u_time: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 pos2;
      uniform float u_time;

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
        vec3 pos = position;
        pos2 = (projectionMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        pos.x += noise(pos.xy/100. + u_time * 0.5) * 20.;
        pos.y += noise(pos.xy/100. + u_time * 0.5) * 20.;
        pos.z += noise(pos.xy/100. + u_time * 0.5) * 20.;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float fArray[${arrSize}];
      uniform float u_time;
      varying vec2 vUv;
      

      void main() {

        vec2 st = vUv;
        vec2 store = vUv;

        vec3 col = vec3(st.x, st.y, 0.0);

        gl_FragColor = vec4(col, 0.3);
      }
    `,
  });

  // plane geometry with threejs
  const geometry = new THREE.SphereGeometry(130, 64*2, 64*2);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // add a cube geometry behind
  /*
  const size = 100;
  const geometry2 = new THREE.BoxGeometry(size, size, size);
  const material2 = new THREE.MeshBasicMaterial({ color: new THREE.Color('#000') });
  const cube = new THREE.Mesh(geometry2, material2);
  scene.add(cube);
  // position to the back
  cube.position.z = -150;
  */

  // add a cloud of points 
  const geometry2 = new THREE.BufferGeometry();
  const vertices = new Float32Array(10000 * 3);
  for (let i = 0; i < 10000 * 3; i += 3) {
    vertices[i] = Math.random() * 100 - 50;
    vertices[i + 1] = Math.random() * 100 - 50;
    vertices[i + 2] = Math.random() * 100 - 50;
  }
  geometry2.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const material2 = new THREE.PointsMaterial({ color: 0x888888 });
  const points = new THREE.Points(geometry2, material2);
  scene.add(points);
  
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  // add time uniform
  const time = performance.now() / 1000;
  mesh.material.uniforms.u_time.value = time;

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
<template>
  <div>
    <canvas id="c1"></canvas>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
// import orbit controls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import simplex noise
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

let stats;
let scene, renderer, camera, canvas, mesh, controls;
let geometryPoints, meshPoints;

// noise for points
let xOff = 1;
let yOff = 1;
let zOff = 100;

let xInc = 0.08;
let yInc = 0.04;
let zInc = 0.002;

const sclX = 50;
const sclZ = 50;

const noise = new SimplexNoise();
// -- end of noise for points

// capturing frequencies
let inc = 0;
let inc2 = 0;
let inc3 = 0;

const signals = useState('signals');
const debug = false;
let minArray = [0];

function init() {

  // create a temporary canvas

  const canvasBack = document.createElement('canvas');
  const contextBack = canvasBack.getContext('2d');

  // Draw something on the canvas
  contextBack.fillStyle = 'red';
  contextBack.fillRect(0, 0, 256*4, 256*4);
  contextBack.fillStyle = 'white';
  contextBack.font = '48px Arial';
  contextBack.textAlign = 'center';
  contextBack.textBaseline = 'middle';
  contextBack.fillText('Hello', 128, 128);

  // endo of create a temporary canvas

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

  const arrSize = signals.value.arrSize;
  // Create a texture from the canvas
  const backgroundTexture = new THREE.CanvasTexture(canvasBack);

  // create shader material
  const material = new THREE.ShaderMaterial({
    transparent:true,
    side: THREE.DoubleSide,
    uniforms: {
      tDiffuse: { value: backgroundTexture },
      fArray: { value: new Float32Array(arrSize) },
      u_time: { value: 0.0 },
      backgroundTexture: { value: null },
      magnifyFactor: { value: 2.0 },
      magnifyCenter: { value: new THREE.Vector2() },
    },
    vertexShader: `
      varying vec2 fragTexCoord;
      varying vec3 pos2;
      uniform float u_time;
      varying vec2 vUv;

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
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }

    `,
    fragmentShader: `
      uniform float fArray[${arrSize}];
      uniform float u_time;
      uniform sampler2D tDiffuse;
      varying vec3 pos2;

      uniform sampler2D backgroundTexture;
      uniform float magnifyFactor;
      uniform vec2 magnifyCenter;
      varying vec2 vUv;
      

      void main() {

        
        vec2 uv = vUv;

        /*
        vec2 diff = uv - magnifyCenter;
        float dist = length(diff);
        if (dist < 0.5) {
          uv = magnifyCenter + diff * magnifyFactor;
        }
        */

        gl_FragColor = texture2D(tDiffuse, uv);
      }
    `,
  });

  // plane geometry with threejs
  const geometry = new THREE.SphereGeometry(100, 64*2, 64*2);
  mesh = new THREE.Mesh(geometry, material);
  // create mesh normal material
  
  // mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial()); 
  mesh.position.z = 40;
  scene.add(mesh);


  // add a cloud of points 
  const texture = new THREE.TextureLoader().load("/textures/disc.png");
  geometryPoints = new THREE.BufferGeometry();
  let positions = [];
  let points = [];
  let colors = [];

  const spread = 3;

  for (let i = -sclX/2; i < sclX/2; i++) {
    for (let j = -sclZ/2; j < sclZ/2; j++) {

      let x = i*spread;
      let y = j*spread;
      let z = 0;

      points.push( new THREE.Vector3(x,y,0) );
      points.push( new THREE.Vector3(x,y,10) );

      positions.push(x, y, z);
      colors.push(0, 0, 0, 1);

    }
  }

  geometryPoints.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometryPoints.setAttribute("color", new THREE.Float32BufferAttribute( colors, 4 ));

  const materialPoints = new THREE.PointsMaterial({
    vertexColors: true,
    map: texture,
    transparent: true,
    depthTest: false,
    size: 2,
  });

  meshPoints = new THREE.Points(geometryPoints, materialPoints);
  scene.add( meshPoints );

  // create controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  
}

function animate() {

  requestAnimationFrame(animate);

  
  stats.update();

  // update controls
  controls.update();


  // add time uniform
  const time = performance.now() / 1000;
  mesh.material.uniforms.u_time.value = time;

  // update cloud points
  const positions = geometryPoints.attributes.position.array;
  yOff = 0;
  let tempVal = 2;

  for (let i = 0; i <sclX; i++) {
    for (let j = 0; j < sclZ; j++) {
      let z = THREE.MathUtils.mapLinear(noise.noise3d(xOff, yOff, zOff), -1, 1, 0, 50);
      xOff += xInc;
      positions[tempVal] = z;
      tempVal += 3;
    }
    yOff += yInc;
    xOff = 0;
  }
  zOff += zInc;
  geometryPoints.attributes.position.needsUpdate = true;

  /* update baed on music
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
  */

  renderer.render(scene,camera);

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
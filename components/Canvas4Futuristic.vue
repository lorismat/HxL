<template>
  <div>
    <canvas id="c1"></canvas>
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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

let camera, scene, targetScene, renderer, controls, canvas, meshPlane, stats;
let renderTarget;
let geometryPoints;


// noise for points
let xOff = 1;
let yOff = 1;
let zOff = 100;

let xInc = 0.08;
let yInc = 0.04;
let zInc = 0.002;

const sclX = 20;
const sclZ = 20;

const noise = new SimplexNoise();
// -- end of noise for points

let inc = 0;
const debug = true;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );

  canvas = document.getElementById("c1");

  renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1.);

  // add controls
  controls = new OrbitControls(camera, renderer.domElement);

  renderTarget = new THREE.WebGLRenderTarget(window.innerWidth*2, window.innerWidth*2);

  // Create a cloud of points mesh that will be rendered to the render target
  targetScene = new THREE.Scene();

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
      colors.push(1, 1, 1, 1);
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
  const meshPoints = new THREE.Points(geometryPoints, materialPoints);
  targetScene.add( meshPoints );

  const SphereGeometry = new THREE.SphereGeometry(75, 64*2, 64*2);
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      myTexture: { value: renderTarget.texture },
      u_time: { value: 0.0 },
    },
    vertexShader: `

      uniform float u_time;

      varying vec2 vUv;
      varying vec3 pos;
      varying vec3 vNormal;

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
        pos = position;
        vNormal = normal;
        
        pos.x += noise(pos.xy/100. + u_time * 0.3) * 20.;
        pos.y += noise(pos.xy/100. + u_time * 0.3) * 20.;
        pos.z += noise(pos.xy/100. + u_time * 0.3) * 20.;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `      
      varying vec2 vUv;
      varying vec3 pos;
      varying vec3 vNormal;
 
      void main() {

        vec2 center = vec2(0.);
        vec3 color = vec3(1.0);

        color *= step(0.75, distance(vNormal.xy, center));

        gl_FragColor = vec4(color, pow(1.-0.2*distance(vNormal.zz, center), 8.)); // output magnified color
      }
    `
  });

  shaderMaterial.transparent = true;
  meshPlane = new THREE.Mesh(SphereGeometry, shaderMaterial);
  scene.add(meshPlane);
  
  camera.position.set(0,0,200);
  camera.lookAt( scene.position );

  stats = new Stats();
  if (debug) document.body.appendChild( stats.dom );
  
}

function animate() {
  requestAnimationFrame(animate);

  inc += 0.003;

  // update uniform time
  const time = performance.now() * 0.001;
  meshPlane.material.uniforms.u_time.value = time;

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


  renderer.setRenderTarget(renderTarget);
  renderer.render(targetScene, camera);
  // renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  // update frame stats
  stats.update();

  // update controls
  controls.update();

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
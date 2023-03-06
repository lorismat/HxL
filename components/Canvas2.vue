<template>
  <div>
    <canvas id="c1"></canvas>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// tonejs 
// all package

let stats;
let scene, renderer, camera, canvas;
let mesh;

const debug = false;

const frequencyArraySize = useState('frequencyArraySize');
const analyserDCMeter = useState('analyserDCMeter');
const analyserMeter = useState('analyserMeter');
const analyserFourier = useState('analyserFourier');
const analyserCentroid = useState('analyserCentroid');

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
  renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
  renderer.setPixelRatio( window.devicePixelRatio );
  
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.alpha = true;

  renderer.setClearColor(0x000000, 1.);

  camera.position.set(0,0,1000);
  camera.lookAt( scene.position );

  // add controls
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.maxDistance = 2000;
  // controls.minDistance = 1000;

  // number of lines depends on frequency
  // check what we can get as information

  stats = new Stats();
  if (debug) document.body.appendChild( stats.dom );

  // to improve
  const arrSize = 82;

  // create shader material
  const material = new THREE.ShaderMaterial({
    transparent:true,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2() },
      fArray: { value: new Float32Array(frequencyArraySize.value) },
      cArray: { value: new Float32Array(frequencyArraySize.value) }

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
      uniform float time;
      uniform vec2 resolution;
      uniform float fArray[${arrSize}];
      uniform float cArray[${arrSize}];
      

      float plot(vec2 st, float pct){
        return  smoothstep( pct-0.1, pct, st.y) -
                smoothstep( pct, pct+0.1, st.y);
      }


      varying vec2 vUv;
      void main() {

        vec2 st = vUv;
        vec2 store = vUv;

        float size = float(${arrSize});
        st.y = fract(st.y * size);

        // float y = st.x;
        float y = sin(st.x * 4. * 3.14 * 10. + time * 8.) * clamp(abs( fArray[ int(floor(store.y * size)) ] * 500.  ), 0., 12000.) * 0.00009 * 4. / 10. + 0.5;
    
        // float y = sin(st.x * 4. * 3.14 * 10. + time * 8.) * clamp(abs( cArray[ int(floor(store.y * size)) ] * 500.  ), 0., 12000.) * 0.00009 * 4. / 10. + 0.5;

        // y = st.x;
        float pct = plot(st,y);
        
        vec4 col = vec4(1.);
        vec4 col2 = vec4(1.);
        col = (1.0-pct)*col+pct*vec4(vec3(0.), 0.1);
        col2 = (1.0-pct)*col2+pct*vec4(vec3(0.), 0.9);

        // effect extra 1
        clamp(abs(fArray[ int(floor(store.y * size)) ] * 500.  ), 0., 12000.) > 2000. 
            && 
        clamp(abs(fArray[ int(floor(store.y * size)) ] * 500.  ), 0., 12000.) < 6000. 
            ? 
          col = col : col = col2;

        // clamp(abs( cArray[ int(floor(store.y * size)) ] * 500.  ), 0., 12000.) > 2000. ? col = col : col = col2;

        gl_FragColor = 1.-col;
      }
    `,
  });

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  // update shader material
  mesh.material.uniforms.time.value = performance.now() / 1000;
  mesh.material.uniforms.resolution.value.x = renderer.domElement.width;
  mesh.material.uniforms.resolution.value.y = renderer.domElement.height;


  if (analyserFourier.value != undefined) {

    const fArray = analyserFourier.value;
    const cArray = analyserCentroid.value;
    minArray = [];

    for (let i = 0; i < fArray.length; i += 1) {
      minArray.push(fArray[i]);
    }

    mesh.material.uniforms.fArray.value = minArray;

    console.log(minArray);

    // taking the first value of the array to check if there is sound or not to rotate the sphere
    if (minArray[0] != 0) {
      mesh.rotation.y += 0.0002; 
      mesh.rotation.x += 0.0002;
      mesh.rotation.z += 0.0002;
    }
    
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
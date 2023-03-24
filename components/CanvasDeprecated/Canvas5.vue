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
let scene, renderer, camera, canvas;
let mesh;

const reqID = useState('reqID');
const debug = false;

const signals = useState('signals');

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
  renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
  renderer.setPixelRatio( window.devicePixelRatio );
  
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.alpha = true;

  renderer.setClearColor(0x000000, 1.);

  camera.position.set(0,0,1200);
  camera.lookAt( scene.position );

  stats = new Stats();
  if (debug) document.body.appendChild( stats.dom );

  // arbitrary select X frequencies instead of the signals.value.arrSize
  const arrSize = 32;
  console.log(arrSize);

  const material = new THREE.ShaderMaterial({
    transparent:true,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      fArray: { value: new Float32Array(arrSize) },

    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 pos;
      void main() {
        vec3 pos = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float fArray[${arrSize}];
      

      float plot(vec2 st, float pct){
        return  smoothstep( pct-0.1, pct, st.y) -
                smoothstep( pct, pct+0.1, st.y);
      }


      varying vec2 vUv;
      varying vec3 pos;

      void main() {

        
        vec2 st = vUv;
        vec2 store = vUv;

        float size = float(${arrSize});
        st.y = fract(st.y * size * 2.);

        float y = sin(st.x * 4. * 3.14 * 10. + time * 8.) * clamp(abs( fArray[ int(floor(store.y * size)) ] * 500.  ), 0., 12000.) * 0.00009 * 4. / 10. + 0.5;
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

        // circle with border effect
        // float circle = smoothstep(0.45, 0.5, length(pos.x/1000. - vec2(0.5)));
        // col = mix(col, vec4(1.), step(0.5, store.y));

        // sourrond the shader by a white circle
        col = mix(col, vec4(1.), step(0.5, store.y));


        gl_FragColor = 1.-col;
      }
    `,
  });

  const geometry = new THREE.SphereGeometry(500, 64, 64);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh.rotation.y =  0; 
  mesh.rotation.x = Math.PI / 4;
  mesh.rotation.z = Math.PI / 4;
  
}

function animate() {
  reqID.value = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();

  mesh.material.uniforms.time.value = performance.now() / 1000;

  if (signals.value.powerSpectrum != undefined) {

    const fArray = signals.value.powerSpectrum.slice(0, 32);
    minArray = [];
    for (let i = 0; i < fArray.length; i += 1) {
      minArray.push(fArray[i]);
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

  if (reqID.value != undefined && reqID.value != 0) {
    cancelAnimationFrame(reqID.value);
  }


  window.addEventListener("resize", onWindowResize);
  init();
  animate();
})

</script>
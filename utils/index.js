import * as THREE from 'three';

// Global util functions

// Window width / height
export const win = {
    w: 0,
	h: 0,
};

// Pad numbers
export const pad = (num, size) => {
    return ('000000000' + num).substr(-size);
}

// Is touch device
export const isTouchDevice = { value: false }

// canvas on window resize
export const onWindowResize = (camera, renderer, cellSize) => {
  camera.aspect = 1;
  camera.updateProjectionMatrix();
  // to fix
  renderer.setSize( cellSize.value - 10, cellSize.value - 10);
}

// init camera
export const initCamera = (scene) => {
  const camera = new THREE.PerspectiveCamera(
    70,
    1,
    1,
    3000
  );
  camera.position.set(0,0,1000);
  camera.lookAt( scene.position );
  return camera
}

// init renderer 
export const initRenderer = (canvas, window, cellSize) => {
  const renderer = new THREE.WebGLRenderer({ antialias : true, canvas });
  renderer.setPixelRatio( window.devicePixelRatio );
  // to fix: with size of cells
  renderer.setSize( cellSize.value - 70, cellSize.value - 70);
  renderer.setClearColor(0x000000, 1.);
  return renderer 
}

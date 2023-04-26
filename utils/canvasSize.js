export const canvasSize = (size, canvas, renderer, camera) => {
  if (size === 'small') {
    canvas.style.position = 'initial';
    canvas.style.zIndex = 'initial';
    canvas.style.border = '1px dashed #cccccc';
  } else {
    camera.aspect = window.innerWidth / window.innerHeight ;
    camera.updateProjectionMatrix();
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = -1;
    canvas.style.border = 'none';
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  return
}
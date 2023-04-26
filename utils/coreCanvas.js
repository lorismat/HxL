import canvas1 from './canvas/canvas1';
import canvas2 from './canvas/canvas2';
import canvas3 from './canvas/canvas3';
import canvas4 from './canvas/canvas4';



export const coreCanvas = (id) => {
  if (id == 1) {
    canvas1();
  } else if (id == 2) {
    canvas2();
  } else if (id == 3) {
    canvas3();
  } else if (id == 4) {
    canvas4();
  }
  return
}
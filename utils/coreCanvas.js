import mainClass from './canvas/mainClass';


export const coreCanvas = (id) => {
  if (id == 1) {
    const cv1 = new mainClass(
      id, 
      16
    );
    cv1.intro();
    return cv1
  } else if (id == 2) {
    const cv2 = new mainClass(
      id, 
      0
    );
    cv2.intro();
    return cv2
  } else if (id == 3) {
    const cv3 = new mainClass(
      id, 
      0
    );
    cv3.intro();
    return cv3
  } else if (id == 4) {
    const cv4 = new mainClass(
      id, 
      0
    );
    cv4.intro();
    return cv4
  } else if (id == 5) {
    const cv4 = new mainClass(
      id, 
      0
    );
    cv5.intro();
    return cv5
  } else if (id == 6) {
    const cv6 = new mainClass(
      id, 
      0
    );
    cv6.intro();
    return cv6
  }




}
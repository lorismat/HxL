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
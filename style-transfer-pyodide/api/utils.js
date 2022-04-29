function convertDataURIToBinary(dataURI) {
  return Uint8Array.from(atob(dataURI.replace(/^data[^,]+,/, '')), (v) => v.charCodeAt(0));
}

async function downloadResource(url) {
  const resp = await fetch(url);
  const buffer = await resp.arrayBuffer();
  return buffer;
}

async function getImageDimensions(file) {
  return new Promise((resolved) => {
    const i = new Image();
    i.onload = () => {
      resolved({ w: i.naturalWidth, h: i.naturalHeight });
    };
    i.src = file;
  });
}

export default {
  convertDataURIToBinary,
  downloadResource,
  getImageDimensions,
};

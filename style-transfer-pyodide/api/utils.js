function convertDataURIToBinary(dataURI) {
  return Uint8Array.from(atob(dataURI.replace(/^data[^,]+,/, '')), (v) => v.charCodeAt(0));
}

async function downloadResource(url) {
  const resp = await fetch(url);
  const buffer = await resp.arrayBuffer();
  return buffer;
}

export default {
  convertDataURIToBinary,
  downloadResource,
};

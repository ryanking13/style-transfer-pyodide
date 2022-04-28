function debug() {
  const el = document.createElement('div');
  document.body.appendChild(el);

  eruda.init({
    container: el,
  });
}

export default {
  debug,
};

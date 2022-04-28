import Worker from '~/assets/js/pyodide.worker.js';

export default (_, inject) => {
  inject('worker', {
    createWorker() {
      return new Worker();
    },
  });
};

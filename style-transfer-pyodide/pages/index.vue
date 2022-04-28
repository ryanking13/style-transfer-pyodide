<template>
  <div>
    <loading :active="isLoading === true" :message="loadingMessage" />
    <github-ribbon />
    <section class="container">
      <div>
        <div>
          <h1 is="sui-header" color="violet" text-align="center">
            Pyodide style transfer playground
          </h1>
          <upload :onAdd="onImageAdd" />
        </div>
        <div>
          <img id="image-before" src="" alt="" />
          <img id="image-after" src="" alt="" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import GithubRibbon from '~/components/GithubRibbon';
import Upload from '~/components/UploadBox';
import Loading from '~/components/LoadingModal';
import api from '~/api/api';
import utils from '~/api/utils';
// import helper from '~/api/helper';

export default {
  name: 'IndexPage',
  data() {
    return {
      pyodideWorker: null,
      pyodideLoaded: false,
      isLoading: false,
      loadingMessage: '',
    };
  },
  components: {
    GithubRibbon,
    Upload,
    Loading,
  },
  methods: {
    setLoading(status) {
      this.isLoading = status;
    },
    setLoadingMessage(message) {
      this.loadingMessage = message;
    },
    onImageAdd(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // console.log(event.target.result); // data url
        this.runInference(event.target.result);
      };
      reader.readAsDataURL(file);
    },
    async runInference(img) {
      await this.saveImage(img, 'image.jpg');
      const imgStylized = await this.stylize('image.jpg');
      document.getElementById('image-before').src = img;
      document.getElementById('image-after').src = imgStylized;
    },
    async saveImage(img, path) {
      const imgBinary = utils.convertDataURIToBinary(img);
      await api.writeFile(this.pyodideWorker, path, imgBinary);
    },
    async downloadSampleImage() {
      await api.runScript(
        this.pyodideWorker,
        `
        from pyodide.http import pyfetch
        response = await pyfetch("https://raw.githubusercontent.com/rrmina/fast-neural-style-pytorch/master/images/up-diliman.jpg")
        if response.status == 200:
          with open("image.jpg", "wb") as f:
            f.write(await response.bytes())
        `,
      );
    },
    async stylize(imgPath) {
      this.setLoading(true);
      this.setLoadingMessage('Running stylize');

      await api.runScript(
        this.pyodideWorker,
        `
        img = stylize.stylize("${imgPath}")
        cv.imwrite("image_stylized.jpg", img)
      `,
      );

      const data = await api.readFile(
        this.pyodideWorker,
        'image_stylized.jpg',
        'image/jpeg',
      );
      const url = window.URL.createObjectURL(data);

      this.setLoading(false);
      return url;
    },
    async init() {
      this.pyodideLoaded = false;
      this.setLoading(true);

      this.setLoadingMessage('(1 / 2) Loading Pyodide...');
      this.pyodideWorker = this.$worker.createWorker();
      const [archive, _] = await Promise.all([
        utils.downloadResource('style_transfer.tar.gz'),
        api.runScript(
          this.pyodideWorker,
          `
          import cv2 as cv
          `,
        ),
      ]);

      this.setLoadingMessage('(2 / 2) Loading model...');
      await api.unpack(this.pyodideWorker, archive);
      await api.runScript(
        this.pyodideWorker,
        `
        import stylize
        stylize.initialize_network("model.onnx")
        `,
      );

      this.setLoading(false);
      this.pyodideLoaded = true;
    },
  },
  async mounted() {
    // helper.debug();

    await this.init();
  },
};
</script>

<style scoped>
.container {
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
img {
  max-width: 40%;
  height: auto;
  width: auto;
}
</style>

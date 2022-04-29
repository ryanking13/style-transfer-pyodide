<template>
  <div>
    <loading :active="isLoading === true" :message="loadingMessage" />
    <github-ribbon />
    <section class="container">
      <div>
        <div>
          <h1 is="sui-header" color="blue" text-align="center">
            Pyodide style transfer playground
          </h1>
          <upload :onAdd="onImageAdd" />
        </div>
        <div class="subcontainer">
          <sui-button-group>
            <sui-button :color="style === 'mosaic' ? 'blue': 'grey'" :active="style === 'mosaic'" @click="setStyle('mosaic')">Style: Mosaic</sui-button>
            <sui-button-or />
            <sui-button :color="style === 'udnie' ? 'blue': 'grey'" :active="style === 'udnie'" @click="setStyle('udnie')">Style: Udnie</sui-button>
          </sui-button-group>
        </div>
        <div class="subcontainer">
          <sui-checkbox label="Resize Image (makes inference faster)" toggle v-model="resize" />
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
import helper from '~/api/helper';

export default {
  name: 'IndexPage',
  data() {
    return {
      pyodideWorker: null,
      pyodideLoaded: false,
      isLoading: false,
      loadingMessage: '',
      resize: false,
      style: 'mosaic',
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
      this.loadingMessage = message.trim();
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
      const imgSize = await utils.getImageDimensions(img);
      await this.saveImage(img, 'image.jpg');
      try {
        const imgStylized = await this.stylize('image.jpg', imgSize);
        document.getElementById('image-before').src = img;
        document.getElementById('image-after').src = imgStylized;
      } catch (e) {
        this.setLoading(false);
        console.error(e);
      }
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
    async stylize(imgPath, imgSize) {
      this.setLoading(true);
      this.setLoadingMessage('Running stylization...');

      if (imgSize.w * imgSize.h > 1000000) {
        this.setLoadingMessage(`
          Running stylization...
          (If the image is large, it can take 1~2 minutes)
        `);
      }

      const maxWidth = this.resize ? 500 : 1500;
      await api.runScript(
        this.pyodideWorker,
        `
        img = stylize.stylize("${imgPath}", ${maxWidth})
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
    async setStyle(style) {
      const stylePath = {
        mosaic: 'mosaic.onnx',
        udnie: 'udnie.onnx',
      }[style];

      await api.runScript(
        this.pyodideWorker,
        `stylize.initialize_network("${stylePath}")`,
      );
      this.style = style;
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
        `,
      );
      await this.setStyle(this.style);

      this.setLoading(false);
      this.pyodideLoaded = true;
    },
  },
  async mounted() {
    if (process.env.NODE_ENV !== 'production') {
      helper.debug();
    }

    await this.init();
  },
};
</script>

<style scoped>
.container {
  max-width: 100%;
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.subcontainer {
  max-width: 100%;
  margin-top: 10px;
  margin-bottom: 15px;
}
img {
  max-width: 40%;
  height: auto;
  width: auto;
}
</style>

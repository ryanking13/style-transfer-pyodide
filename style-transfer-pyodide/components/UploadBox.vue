<template>
  <dropzone
    id="dropzone"
    ref="el"
    :options="dropzoneOptions"
    @vdropzone-file-added="onAdd"
    :useCustomSlot="true"
    :include-styling="true"
  >
    <h3 class="dropzone-custom-title">
      Click to upload Image
    </h3>
  </dropzone>
</template>

<style>
body {
  background: rgb(243, 244, 245);
  height: 100%;
  color: rgb(100, 108, 127);
  line-height: 1.4rem;
  font-family: Roboto, "Open Sans", sans-serif;
  font-size: 20px;
  font-weight: 300;
  text-rendering: optimizeLegibility;
}
.dropzone {
  background: white;
  border-radius: 5px;
  border: 2px dashed #3372f5;
  border-image: none;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 30px;
  margin-bottom: 30px;
}
#dropzone .dz-preview {
  width: 160px;
  display: none;
}
#dropzone .dz-message {
  display: block;
}
</style>

<script>
import Dropzone from 'nuxt-dropzone';
import 'nuxt-dropzone/dropzone.css';

export default {
  components: {
    Dropzone,
  },
  props: {
    onAdd: {
      type: Function,
      default() {},
    },
  },
  data() {
    return {
      // See https://rowanwins.github.io/vue-dropzone/docs/dist/index.html#/props
      dropzoneOptions: {
        url: 'http://localhost',
        createImageThumbnails: false,
        autoProcessQueue: false,
        thumbnailWidth: null,
        thumbnailHeight: null,
      },
    };
  },
  mounted() {
    // Everything is mounted and you can access the dropzone instance
    /* eslint-disable */
    const instance = this.$refs.el.dropzone;
    /* eslint-enable */
  },
};
</script>

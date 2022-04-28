<template>
  <sui-dimmer :active="active" inverted>
    <sui-loader :content="message" />
  </sui-dimmer>
</template>

<script>
export default {
  props: ['message', 'active'],
};
</script>

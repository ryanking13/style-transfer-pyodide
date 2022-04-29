<template>
  <sui-dimmer :active="active" inverted>
    <sui-loader size="large">
        {{ message }}
    </sui-loader>
  </sui-dimmer>
</template>

<script>
export default {
  props: ['message', 'active'],
};
</script>

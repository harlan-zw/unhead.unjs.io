```vue [Modal.vue]
<script lang="ts" setup>
useHead({
  title: 'Subscribe now!',
  htmlAttrs: {
    class: { dark: true, light: false }
  },
  bodyAttrs: { 
    style: { overflow: 'hidden' },
    'data-modal': true,
  },
  link: [{
    rel: 'preload',
    href: 'https://3p.com/subscribe.js',
    as: 'script',
  }],
})
</script>
```

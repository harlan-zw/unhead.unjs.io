<template>
  <div>
    <ScriptCarbonAds
      :key="$route.path"
      format="cover"
      serve="CW7DTKJI"
      placement="unheadunjsio"
      trigger="onNuxtReady"
    >
      <AdsFallback />
    </ScriptCarbonAds>
  </div>
</template>

<style>
.dark #carbon-responsive {
  --carbon-padding: 1em;
  --carbon-max-char: 20ch;
  --carbon-bg-primary: var(--ui-bg);
  --carbon-bg-secondary: var(--ui-bg-muted);
  --carbon-text-color: var(--ui-text);
}

#carbon-responsive .carbon-responsive-wrap {
  border-radius: var(--ui-radius);
}
</style>

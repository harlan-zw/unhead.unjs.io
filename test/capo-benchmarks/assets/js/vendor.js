// vendor.js - Sync script: mock vendor bundle namespace
(function () {
  window.Vendor = {
    version: '1.0.0',
    utils: {
      noop() {},
      now() { return Date.now() },
      id(x) { return x },
    },
    config: {
      debug: false,
      env: 'benchmark',
    },
  }

  console.log(`[vendor.js] Vendor namespace initialized v${window.Vendor.version}`)
})()

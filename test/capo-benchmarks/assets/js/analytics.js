// analytics.js - Async script: mock analytics
(function () {
  window.__analytics = {
    initialized: true,
    timestamp: Date.now(),
    events: [],
  }

  window.__analytics.track = function (event, data) {
    window.__analytics.events.push({ event, data, time: Date.now() })
    console.log(`[analytics.js] tracked: ${event}`)
  }

  console.log(`[analytics.js] Analytics initialized at ${new Date().toISOString()}`)
})()

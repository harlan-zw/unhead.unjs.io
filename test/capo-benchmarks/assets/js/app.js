// app.js - Sync script: logs timing metrics and displays load time
(function () {
  const startTime = performance.now()

  document.addEventListener('DOMContentLoaded', () => {
    const dcl = performance.now() - startTime
    console.log(`[app.js] DOMContentLoaded: ${dcl.toFixed(2)}ms`)
  })

  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime
    console.log(`[app.js] load: ${loadTime.toFixed(2)}ms`)

    // Display load time on page
    const el = document.createElement('div')
    el.id = 'load-time'
    el.textContent = `Load: ${loadTime.toFixed(0)}ms | DCL: ${performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart}ms`
    document.body.appendChild(el)

    // Log Core Web Vitals if available
    if (window.PerformanceObserver) {
      try {
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log(`[app.js] LCP: ${entry.startTime.toFixed(2)}ms`)
          })
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (_e) {
        // LCP observer not supported
      }
    }
  })
})()

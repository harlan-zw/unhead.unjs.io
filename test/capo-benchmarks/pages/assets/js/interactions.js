// Simulated interaction handlers (deferred)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-lazy]').forEach((el) => {
    el.setAttribute('data-loaded', 'true')
  })
})

// Simulated lazy component loader (deferred)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.animationDelay = `${i * 50}ms`
  })
})

// lazy-components.js - Defer script: lazy-loads card components
(function () {
  const cards = document.querySelectorAll('.card[data-lazy]')
  cards.forEach((card) => {
    card.classList.add('card--loaded')
    card.removeAttribute('data-lazy')
  })

  console.log(`[lazy-components.js] Lazy-loaded ${cards.length} card components`)
})()

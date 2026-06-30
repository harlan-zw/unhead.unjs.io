// interactions.js - Defer script: adds click handlers to nav items
(function () {
  const navLinks = document.querySelectorAll('nav a')
  navLinks.forEach((link) => {
    link.addEventListener('click', (_e) => {
      console.log(`[interactions.js] nav click: ${link.textContent}`)
    })
  })

  console.log(`[interactions.js] Interaction handlers attached to ${navLinks.length} nav links`)
})()

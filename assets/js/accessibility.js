/* Expose the upstream theme's menu state to assistive technology. */
document.querySelectorAll('button[aria-controls]').forEach(function (button) {
  var menu = document.getElementById(button.getAttribute('aria-controls'));
  if (!menu) return;

  function updateState() {
    var visible = window.getComputedStyle(menu).display !== 'none';
    button.setAttribute('aria-expanded', String(visible));
  }

  new MutationObserver(updateState).observe(menu, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  window.addEventListener('resize', updateState);
  updateState();

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true'
        && window.getComputedStyle(button).display !== 'none') {
      button.click();
      button.focus();
    }
  });
});

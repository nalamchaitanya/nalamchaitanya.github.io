/* Reveal contact details only when a visitor opens the disclosure.
 * This deters basic scrapers; any public address can still be recovered.
 */
document.querySelectorAll('.email-contact[data-email]').forEach(function (contact) {
  contact.addEventListener('toggle', function () {
    if (!contact.open || !contact.dataset.email) return;

    var address = window.atob(contact.dataset.email);
    var link = document.createElement('a');
    link.href = 'mailto:' + address;
    link.textContent = address;
    var output = contact.querySelector('.email-contact__address');
    output.textContent = '';
    output.appendChild(link);
    contact.removeAttribute('data-email');
  });
});

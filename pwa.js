if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('Service Worker Registrierung erfolgreich mit Scope:', registration.scope);
      })
      .catch(function(err) {
        console.log('Service Worker Registrierung fehlgeschlagen:', err);
      });
  });
}

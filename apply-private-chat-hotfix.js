const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'index.html');

if (!fs.existsSync(file)) {
  console.error('No encontré index.html. Copiá este archivo dentro de la carpeta del proyecto nombreweb-demo y ejecutalo ahí.');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');
const backup = path.join(process.cwd(), `index.backup-private-chat-${Date.now()}.html`);
fs.writeFileSync(backup, html, 'utf8');
console.log('Backup creado:', path.basename(backup));

const helper = `
<script>
(function(){
  window.safeUserName = window.safeUserName || function(u){
    return (u && (u.alias || u.displayName || u.username || u.name || u.email)) || 'Usuario sin nombre';
  };

  window.openPrivateChatWindow = function(userId, alias){
    if(!userId) return;
    const cleanAlias = alias || 'Usuario sin nombre';
    const url = new URL(window.location.href);
    url.searchParams.set('privateChat', userId);
    url.searchParams.set('privateName', cleanAlias);
    window.open(url.toString(), '_blank', 'noopener,noreferrer,width=520,height=760');
  };

  const originalStartPrivateChat = window.startPrivateChat;
  window.startPrivateChat = function(userId, alias){
    window.openPrivateChatWindow(userId, alias);
    if(typeof originalStartPrivateChat === 'function'){
      try { originalStartPrivateChat(userId, alias); } catch(e) {}
    }
  };

  function bootPrivateChatFromUrl(){
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('privateChat');
    const privateName = params.get('privateName') || 'Usuario sin nombre';
    if(!userId) return;

    document.body.classList.add('private-chat-page');

    const title = document.querySelector('#chatTitle, .chatTitle, [data-chat-title]');
    if(title) title.textContent = 'Chat privado con ' + privateName;

    const sub = document.querySelector('#chatSub, .chatSub, [data-chat-sub]');
    if(sub) sub.textContent = 'Ventana privada';

    setTimeout(function(){
      if(typeof window.selectPrivateChat === 'function') window.selectPrivateChat(userId, privateName);
      if(typeof originalStartPrivateChat === 'function'){
        try { originalStartPrivateChat(userId, privateName); } catch(e) {}
      }
    }, 400);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootPrivateChatFromUrl);
  } else {
    bootPrivateChatFromUrl();
  }
})();
</script>
`;

if (!html.includes('openPrivateChatWindow')) {
  html = html.replace('</body>', helper + '\n</body>');
}

// Cambia botones o clicks frecuentes de startPrivateChat para que abran nueva pestaña.
html = html.replace(/onclick="startPrivateChat\(([^\"]+)\)"/g, 'onclick="openPrivateChatWindow($1)"');
html = html.replace(/onclick='startPrivateChat\(([^']+)\)'/g, "onclick='openPrivateChatWindow($1)'");

// Si existe un botón textual de privado generado en templates, queda forzado a usar la ventana nueva.
html = html.replace(/startPrivateChat\(/g, 'openPrivateChatWindow(');
// Evitar romper la definición del wrapper recién agregado si el replace anterior la tocó.
html = html.replace(/window\.openPrivateChatWindow = function/g, 'window.openPrivateChatWindow = function');
html = html.replace(/const originalStartPrivateChat = window\.openPrivateChatWindow;/g, 'const originalStartPrivateChat = window.startPrivateChat;');
html = html.replace(/window\.openPrivateChatWindow = function\(userId, alias\)\{\n\s*window\.openPrivateChatWindow\(userId, alias\);/g, `window.startPrivateChat = function(userId, alias){\n    window.openPrivateChatWindow(userId, alias);`);

fs.writeFileSync(file, html, 'utf8');
console.log('Hotfix aplicado. Ahora el chat privado abre una pestaña/ventana nueva.');
console.log('Luego ejecutá: git add . && git commit -m "Hotfix chat privado en ventana nueva" && git push');

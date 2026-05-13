const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(file)) {
  console.error('No encontré index.html. Copiá este archivo dentro de la carpeta del proyecto nombreweb-demo y ejecutalo ahí.');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');
const marker = 'velvet-private-chat-new-tab-hotfix-v3';
if (html.includes(marker)) {
  console.log('El hotfix ya estaba aplicado. No hice cambios.');
  process.exit(0);
}

const backup = file + '.backup-private-chat-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(backup, html, 'utf8');

const patch = `
<script id="${marker}">
(function(){
  const HOTFIX = '${marker}';

  function safeDecode(v){
    try { return decodeURIComponent(v || ''); } catch(e){ return v || ''; }
  }

  function userLabel(raw){
    return raw && raw !== 'usuario' && raw !== 'Usuario'
      ? raw
      : 'Usuario sin nombre';
  }

  function buildPrivateUrl(userId, alias){
    const url = new URL(window.location.href);
    url.searchParams.set('privateChat', '1');
    url.searchParams.set('with', userId);
    url.searchParams.set('name', alias || 'Usuario sin nombre');
    url.hash = 'chat-privado';
    return url.toString();
  }

  window.openPrivateChatTab = function(userId, alias){
    if(!userId){
      console.warn('[Velvet] No se pudo abrir privado: falta userId');
      return false;
    }

    const finalAlias = userLabel(alias);
    const url = buildPrivateUrl(userId, finalAlias);

    // Abre una pestaña/ventana independiente y mantiene intacto el chat general.
    const popup = window.open(url, 'velvet_privado_' + String(userId).replace(/[^a-zA-Z0-9_-]/g, ''), 'popup=yes,width=520,height=780,left=80,top=60');

    // Si el navegador bloquea popups, abrimos en una pestaña normal.
    if(!popup){
      window.open(url, '_blank');
    }

    return false;
  };

  // Guardamos las funciones originales, si existen, para usarlas dentro de la pestaña privada.
  const originalFns = {};
  ['startPrivateChat','openPrivateChat','openPrivateConversation','selectPrivateChat','loadPrivateChat','openChatWithUser','startChatWithUser'].forEach(function(fn){
    if(typeof window[fn] === 'function') originalFns[fn] = window[fn];
  });
  window.__velvetOriginalPrivateFns = originalFns;

  // Desde el chat general, cualquier intento de abrir privado debe abrir una nueva pestaña.
  ['startPrivateChat','openPrivateChat','openPrivateConversation','selectPrivateChat','loadPrivateChat','openChatWithUser','startChatWithUser'].forEach(function(fn){
    window[fn] = function(userId, alias){
      return window.openPrivateChatTab(userId, alias);
    };
  });

  function extractFromOnclick(str){
    if(!str) return null;
    const m = str.match(/(?:startPrivateChat|openPrivateChat|openPrivateConversation|selectPrivateChat|loadPrivateChat|openChatWithUser|startChatWithUser)\s*\(\s*['\"]([^'\"]+)['\"]\s*(?:,\s*['\"]([^'\"]*)['\"])?/i);
    if(m) return { id: m[1], name: m[2] || '' };
    return null;
  }

  function findUserData(el){
    let node = el;
    for(let i=0; node && i<8; i++, node=node.parentElement){
      const ds = node.dataset || {};
      const id = ds.userId || ds.userid || ds.uid || ds.profileId || ds.profileid || ds.id || node.getAttribute('data-user') || node.getAttribute('data-user-id');
      const name = ds.name || ds.alias || ds.username || ds.displayName || ds.displayname || node.getAttribute('data-name') || node.getAttribute('data-alias');
      if(id) return { id, name: name || '' };
      const oc = node.getAttribute && node.getAttribute('onclick');
      const parsed = extractFromOnclick(oc);
      if(parsed) return parsed;
    }
    return null;
  }

  // Intercepta botones/enlaces actuales aunque el HTML no haya sido reescrito.
  document.addEventListener('click', function(ev){
    const clickable = ev.target.closest && ev.target.closest('button, a, [role="button"], .btn, .pill');
    if(!clickable) return;

    const text = (clickable.innerText || clickable.textContent || '').trim().toLowerCase();
    const onclick = clickable.getAttribute && clickable.getAttribute('onclick');
    const parsed = extractFromOnclick(onclick);

    const looksPrivate = parsed || text === 'privado' || text.includes('mensaje privado') || text.includes('chat privado') || text.includes('hablar por privado');
    if(!looksPrivate) return;

    const data = parsed || findUserData(clickable);
    if(!data || !data.id) return;

    ev.preventDefault();
    ev.stopPropagation();
    ev.stopImmediatePropagation();
    window.openPrivateChatTab(data.id, data.name || clickable.getAttribute('data-name') || 'Usuario sin nombre');
    return false;
  }, true);

  function enterPrivateWindow(){
    const params = new URLSearchParams(window.location.search);
    if(params.get('privateChat') !== '1') return;

    const otherUserId = params.get('with');
    const otherUserName = userLabel(safeDecode(params.get('name')));

    document.title = 'Privado con ' + otherUserName + ' · Velvet';
    document.body.classList.add('velvet-private-window');

    const style = document.createElement('style');
    style.textContent = `
      body.velvet-private-window::before{
        content:'Chat privado con ${otherUserName.replace(/'/g, "\\'")}';
        position:fixed; top:0; left:0; right:0; z-index:999999;
        background:#111827; color:#fff; padding:10px 14px;
        font:600 14px system-ui,-apple-system,Segoe UI,sans-serif;
        box-shadow:0 8px 30px rgba(0,0,0,.25);
      }
      body.velvet-private-window{ padding-top:48px !important; }
      .velvet-private-close{
        position:fixed; top:7px; right:10px; z-index:1000000;
        border:0; border-radius:999px; padding:7px 12px;
        background:#ef4444; color:#fff; font-weight:700; cursor:pointer;
      }
    `;
    document.head.appendChild(style);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'velvet-private-close';
    closeBtn.textContent = 'Cerrar privado';
    closeBtn.onclick = function(){ window.close(); };
    document.body.appendChild(closeBtn);

    // En esta pestaña sí intentamos abrir/cargar la conversación privada dentro de la app.
    setTimeout(function(){
      const fns = window.__velvetOriginalPrivateFns || {};
      const candidates = ['startPrivateChat','openPrivateChat','openPrivateConversation','selectPrivateChat','loadPrivateChat','openChatWithUser','startChatWithUser'];
      for(const fn of candidates){
        if(typeof fns[fn] === 'function'){
          try { fns[fn](otherUserId, otherUserName); return; } catch(e){ console.warn('[Velvet] Falló función privada original:', fn, e); }
        }
      }

      // Fallback: cambia hash y muestra aviso útil si la app no tiene función privada disponible.
      location.hash = 'chat-privado';
      const notice = document.createElement('div');
      notice.style.cssText = 'position:fixed;left:14px;right:14px;bottom:14px;z-index:1000000;background:#fff;color:#111827;border:1px solid #ddd;border-radius:14px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,.25);font-family:system-ui';
      notice.innerHTML = '<b>Ventana privada abierta</b><br>Usuario: ' + otherUserName + '<br><small>Si no carga la conversación, falta conectar esta ventana con la función de mensajes privados real.</small>';
      document.body.appendChild(notice);
    }, 700);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', enterPrivateWindow);
  }else{
    enterPrivateWindow();
  }

  console.log('[Velvet] Hotfix aplicado:', HOTFIX);
})();
</script>
`;

if (html.includes('</body>')) {
  html = html.replace('</body>', patch + '\n</body>');
} else {
  html += '\n' + patch;
}

fs.writeFileSync(file, html, 'utf8');
console.log('Listo. Hotfix aplicado. Backup creado en: ' + backup);
console.log('Ahora hacé: git add . && git commit -m "Chat privado en pestaña nueva" && git push');

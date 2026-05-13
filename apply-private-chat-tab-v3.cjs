
/**
 * HOTFIX V3 - Chat privado en pestaña nueva
 * Uso: copiar este archivo en la carpeta donde está index.html y ejecutar:
 * node apply-private-chat-tab-v3.js
 */
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'index.html');

if (!fs.existsSync(file)) {
  console.error('No encontré index.html en esta carpeta.');
  console.error('Poné este archivo dentro de la carpeta del proyecto nombreweb-demo y volvé a ejecutar: node apply-private-chat-tab-v3.js');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');

const marker = 'PRIVATE_CHAT_TAB_HOTFIX_V3';

if (html.includes(marker)) {
  console.log('El hotfix V3 ya estaba aplicado.');
  process.exit(0);
}

const injection = `
<script>
/* ${marker} */
(function(){
  function cleanText(v){
    return String(v || '').replace(/\\s+/g,' ').trim();
  }

  function getNameFromNode(node){
    const row = node.closest('[data-user-id],[data-id],.user,.person,.profile,.onlineItem,.online-user,.member,.card,.modal') || node.parentElement;
    const candidates = [
      node.getAttribute('data-alias'),
      node.getAttribute('data-name'),
      row && row.getAttribute && row.getAttribute('data-alias'),
      row && row.getAttribute && row.getAttribute('data-name'),
      row && row.querySelector && row.querySelector('[data-name]') && row.querySelector('[data-name]').getAttribute('data-name'),
      row && row.querySelector && row.querySelector('.name,.alias,.username,.userName,.profileName') && row.querySelector('.name,.alias,.username,.userName,.profileName').textContent,
      row && row.textContent
    ];

    let name = candidates.find(Boolean) || 'Usuario';
    name = cleanText(name)
      .replace(/Mensaje|Privado|Chat privado|Cámara|Camara|Reportar|Favorito|❤️|📷/gi,'')
      .trim();

    return name || 'Usuario';
  }

  function getIdFromNode(node){
    const row = node.closest('[data-user-id],[data-id],[data-profile-id],.user,.person,.profile,.onlineItem,.online-user,.member,.card,.modal') || node.parentElement;

    const attrs = ['data-user-id','data-id','data-profile-id','data-peer-id','data-to','data-target'];
    for (const attr of attrs) {
      if (node.getAttribute && node.getAttribute(attr)) return node.getAttribute(attr);
      if (row && row.getAttribute && row.getAttribute(attr)) return row.getAttribute(attr);
    }

    const raw = [
      node.getAttribute && node.getAttribute('onclick'),
      row && row.getAttribute && row.getAttribute('onclick'),
      node.outerHTML,
      row && row.outerHTML
    ].filter(Boolean).join(' ');

    const uuid = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (uuid) return uuid[0];

    const quoted = raw.match(/['"]([^'"]{6,})['"]/);
    if (quoted && !/privado|mensaje|button|class|onclick/i.test(quoted[1])) return quoted[1];

    return null;
  }

  function buildPrivateUrl(userId, alias){
    const url = new URL(window.location.href);
    url.searchParams.set('privateChat', '1');
    if (userId) url.searchParams.set('to', userId);
    if (alias) url.searchParams.set('name', alias);
    return url.toString();
  }

  window.openPrivateChatTab = function(userId, alias){
    const safeAlias = alias || 'Usuario';
    const nextUrl = buildPrivateUrl(userId || '', safeAlias);

    const win = window.open(nextUrl, '_blank');
    if (!win) {
      alert('El navegador bloqueó la pestaña nueva. Permití ventanas emergentes para este sitio y volvé a tocar Privado.');
      return false;
    }
    return false;
  };

  const originalNames = [
    'startPrivateChat',
    'openPrivateChat',
    'openPrivate',
    'startPrivate',
    'selectPrivate',
    'openConversation',
    'startConversation'
  ];

  originalNames.forEach(function(fn){
    const previous = window[fn];
    window[fn] = function(userId, alias){
      return window.openPrivateChatTab(userId, alias);
    };
    window[fn].__previous = previous;
  });

  document.addEventListener('click', function(e){
    const btn = e.target.closest('button,a,[role="button"],.btn,.action,.chip');
    if (!btn) return;

    const label = cleanText(btn.textContent || btn.getAttribute('aria-label') || btn.title || '');
    const html = btn.outerHTML || '';

    const looksPrivate =
      /\\b(privado|mensaje|chat privado|enviar mensaje|hablar)\\b/i.test(label) ||
      /startPrivateChat|openPrivateChat|openPrivate|privateChat/i.test(html);

    const ignore =
      /login|ingresar|registro|crear cuenta|enviar$|cerrar sesión/i.test(label);

    if (!looksPrivate || ignore) return;

    const userId = getIdFromNode(btn);
    const alias = getNameFromNode(btn);

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    window.openPrivateChatTab(userId, alias);
    return false;
  }, true);

  function setupPrivateTabView(){
    const params = new URLSearchParams(window.location.search);
    if (params.get('privateChat') !== '1') return;

    const alias = params.get('name') || 'Usuario';
    document.title = 'Privado con ' + alias + ' - Velvet';

    const banner = document.createElement('div');
    banner.id = 'private-chat-tab-banner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#111827;color:white;padding:10px 14px;font-family:system-ui,Arial;font-size:14px;box-shadow:0 4px 18px rgba(0,0,0,.25);display:flex;justify-content:space-between;align-items:center;gap:10px;';
    banner.innerHTML = '<div><b>Chat privado con ' + alias.replace(/[<>]/g,'') + '</b><br><span style="opacity:.75;font-size:12px">Esta pestaña es independiente. El chat general queda abierto en la otra pestaña.</span></div><button id="closePrivateTabBtn" style="border:0;border-radius:999px;padding:8px 12px;cursor:pointer">Cerrar</button>';
    document.body.appendChild(banner);

    document.body.style.paddingTop = '58px';

    setTimeout(function(){
      const chatButtons = Array.from(document.querySelectorAll('button,a,[role="button"]'));
      const chatBtn = chatButtons.find(x => /chat general|chat|privados/i.test(cleanText(x.textContent || '')));
      if (chatBtn) chatBtn.click();
    }, 800);

    banner.querySelector('#closePrivateTabBtn').onclick = function(){ window.close(); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPrivateTabView);
  } else {
    setupPrivateTabView();
  }

  console.log('PRIVATE_CHAT_TAB_HOTFIX_V3 aplicado correctamente');
})();
</script>
`;

if (html.includes('</body>')) {
  html = html.replace('</body>', injection + '\n</body>');
} else {
  html += injection;
}

const backup = file + '.backup-private-chat-v3-' + Date.now();
fs.copyFileSync(file, backup);
fs.writeFileSync(file, html, 'utf8');

console.log('Listo. Hotfix V3 aplicado en index.html');
console.log('Backup creado en:', path.basename(backup));
console.log('Ahora hacé: git add . && git commit -m "Fix chat privado pestaña nueva" && git push');

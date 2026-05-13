const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(file)) {
  console.error('No encontré index.html en esta carpeta. Abrí PowerShell dentro de la carpeta del proyecto.');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');
const backup = path.join(process.cwd(), `index.html.backup-floating-final-${Date.now()}`);
fs.writeFileSync(backup, html, 'utf8');

// Limpiar versiones anteriores del hotfix si existieran
html = html.replace(/<!-- FLOATING_MESSENGER_FINAL_START -->[\s\S]*?<!-- FLOATING_MESSENGER_FINAL_END -->/g, '');

const injection = `
<!-- FLOATING_MESSENGER_FINAL_START -->
<style>
  .vfm-root{position:fixed;right:18px;bottom:18px;z-index:999999;font-family:Inter,Arial,sans-serif;color:#fff;pointer-events:none}
  .vfm-launcher{pointer-events:auto;border:0;border-radius:999px;padding:12px 18px;font-weight:900;color:#fff;background:linear-gradient(135deg,#ec2fa6,#8b5cf6);box-shadow:0 15px 40px rgba(0,0,0,.45);cursor:pointer}
  .vfm-panel{pointer-events:auto;width:min(860px,calc(100vw - 36px));height:min(620px,calc(100vh - 80px));display:none;background:#0f0f17;border:1px solid rgba(255,255,255,.14);border-radius:22px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.65)}
  .vfm-panel.vfm-open{display:flex}
  .vfm-contacts{width:300px;background:#11111b;border-right:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column}
  .vfm-head{height:64px;display:flex;align-items:center;gap:12px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.1);letter-spacing:.14em;font-weight:900;text-transform:uppercase}
  .vfm-close{margin-left:auto;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff;width:34px;height:34px;border-radius:12px;cursor:pointer;font-weight:900}
  .vfm-list{overflow:auto;flex:1;padding:8px}
  .vfm-contact{display:flex;align-items:center;gap:12px;width:100%;border:0;background:transparent;color:#fff;border-radius:14px;padding:10px;cursor:pointer;text-align:left;border-bottom:1px solid rgba(255,255,255,.06)}
  .vfm-contact:hover,.vfm-contact.vfm-active{background:rgba(255,255,255,.08)}
  .vfm-avatar{width:42px;height:42px;border-radius:999px;background:linear-gradient(135deg,#ec2fa6,#8b5cf6);display:grid;place-items:center;font-weight:900;flex:0 0 auto;overflow:hidden}
  .vfm-avatar img{width:100%;height:100%;object-fit:cover}
  .vfm-name{font-weight:900;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
  .vfm-status{font-size:12px;color:#9ca3af;margin-top:2px}.vfm-status.on{color:#5cff98}.vfm-status.off{color:#9ca3af}
  .vfm-chat{flex:1;display:flex;flex-direction:column;background:#f2eee5;color:#1f2937}
  .vfm-chat-head{height:64px;background:#f8f4ed;border-bottom:1px solid rgba(0,0,0,.12);display:flex;align-items:center;gap:12px;padding:0 18px;color:#111827}
  .vfm-chat-title{font-weight:900}.vfm-chat-sub{font-size:12px;color:#6b7280}.vfm-video{margin-left:auto;border:0;border-radius:10px;background:#2563eb;color:#fff;padding:10px 13px;cursor:pointer;font-weight:800}
  .vfm-messages{flex:1;overflow:auto;padding:18px;display:flex;flex-direction:column;gap:8px}
  .vfm-bubble{max-width:76%;padding:10px 13px;border-radius:16px;line-height:1.35;font-size:14px;box-shadow:0 1px 2px rgba(0,0,0,.08)}
  .vfm-bubble.me{align-self:flex-end;background:#0ea5c8;color:white;border-bottom-right-radius:4px}.vfm-bubble.them{align-self:flex-start;background:white;color:#111827;border-bottom-left-radius:4px}
  .vfm-input{display:flex;gap:8px;padding:12px 14px;background:#f8f4ed;border-top:1px solid rgba(0,0,0,.12)}
  .vfm-input input{flex:1;border:1px solid rgba(0,0,0,.15);border-radius:12px;padding:12px;font-size:14px;background:white;color:#111827;outline:none}.vfm-input button{border:0;border-radius:12px;background:#0ea5c8;color:#fff;font-weight:900;padding:0 16px;cursor:pointer}
  .vfm-empty{height:100%;display:grid;place-items:center;color:#6b7280;text-align:center;padding:30px}.vfm-badge{position:fixed;right:18px;bottom:72px;background:#ef4444;color:#fff;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:900;display:none;z-index:1000000}
  @media(max-width:760px){.vfm-panel{height:calc(100vh - 40px);bottom:10px}.vfm-contacts{width:42%}.vfm-name{max-width:92px}.vfm-chat-head{padding:0 10px}.vfm-video{padding:8px}}
</style>
<script>
(function(){
  if(window.__VELVET_FLOATING_MESSENGER_FINAL__) return;
  window.__VELVET_FLOATING_MESSENGER_FINAL__ = true;

  var state = { open:false, active:null, contacts:[], messages:{} };
  function txt(v){ return (v == null ? '' : String(v)); }
  function safe(v){ return txt(v).replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];}); }
  function idFromName(name){ return txt(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || ('user-' + Date.now()); }
  function initials(name){ return (txt(name).trim()[0] || 'U').toUpperCase(); }

  function extractNameFromCard(el){
    if(!el) return 'Usuario';
    var card = el.closest('button, .user, .online-user, .profile-card, .card, li, [data-user-id], [data-id]') || el;
    var clone = card.cloneNode(true);
    clone.querySelectorAll('button,svg,path,input,select,textarea').forEach(function(n){ n.remove(); });
    var raw = clone.innerText || clone.textContent || '';
    var lines = raw.split(/\n/).map(function(x){return x.trim();}).filter(Boolean);
    var bad = /^(privado|mensaje|favorito|camara|cámara|reportar|online|en línea|actualizar online|solo cámaras)$/i;
    var name = lines.find(function(x){return !bad.test(x) && x.length <= 40;}) || card.getAttribute('data-name') || 'Usuario';
    return name;
  }

  function collectContacts(){
    var map = {};
    document.querySelectorAll('button').forEach(function(btn){
      var label = (btn.innerText || btn.textContent || '').trim();
      if(/^privado$/i.test(label) || /mensaje privado/i.test(label)){
        var name = extractNameFromCard(btn);
        if(name && !/^privado$/i.test(name)) map[idFromName(name)] = {id:idFromName(name), name:name, online:true};
      }
    });
    document.querySelectorAll('[data-user-id],[data-id]').forEach(function(el){
      var name = el.getAttribute('data-name') || extractNameFromCard(el);
      if(name) map[idFromName(name)] = {id:idFromName(name), name:name, online:true};
    });
    var arr = Object.values(map);
    // fallback desde lista visible de Online ahora
    if(arr.length === 0){
      document.querySelectorAll('aside button, aside .card, aside div').forEach(function(el){
        var t = (el.innerText||'').trim();
        if(t && /privado/i.test(t)){
          var name = extractNameFromCard(el);
          if(name) arr.push({id:idFromName(name), name:name, online:true});
        }
      });
    }
    state.contacts = arr;
    return arr;
  }

  function ensureRoot(){
    var root = document.getElementById('vfmRoot');
    if(root) return root;
    root = document.createElement('div');
    root.id = 'vfmRoot';
    root.className = 'vfm-root';
    root.innerHTML = '<div id="vfmBadge" class="vfm-badge">0</div><button id="vfmLauncher" class="vfm-launcher">💬 Privados</button><section id="vfmPanel" class="vfm-panel"><aside class="vfm-contacts"><div class="vfm-head"><button id="vfmClose" class="vfm-close">×</button><span>CONTACTOS</span></div><div id="vfmList" class="vfm-list"></div></aside><main class="vfm-chat"><div id="vfmChatEmpty" class="vfm-empty">Elegí un contacto para iniciar un privado.</div><div id="vfmChatBox" style="display:none;height:100%;flex-direction:column"><div class="vfm-chat-head"><div id="vfmAvatar" class="vfm-avatar">U</div><div><div id="vfmTitle" class="vfm-chat-title">Privado</div><div id="vfmSub" class="vfm-chat-sub">Conversación privada</div></div><button id="vfmVideo" class="vfm-video">📹</button></div><div id="vfmMessages" class="vfm-messages"></div><form id="vfmForm" class="vfm-input"><input id="vfmInput" placeholder="Escribe un mensaje aquí..." autocomplete="off"><button>Enviar</button></form></div></main></section>';
    document.body.appendChild(root);
    document.getElementById('vfmLauncher').addEventListener('click', function(){ openPanel(); });
    document.getElementById('vfmClose').addEventListener('click', function(){ closePanel(); });
    document.getElementById('vfmForm').addEventListener('submit', function(e){ e.preventDefault(); sendMsg(); });
    document.getElementById('vfmVideo').addEventListener('click', function(){ alert('Solicitud de cámara privada para ' + (state.active && state.active.name ? state.active.name : 'usuario') + '. La conexión WebRTC real se integra en el próximo paso.'); });
    return root;
  }

  function renderContacts(){
    ensureRoot();
    var list = document.getElementById('vfmList');
    var contacts = collectContacts();
    if(contacts.length === 0){
      list.innerHTML = '<div style="padding:14px;color:#9ca3af">Todavía no detecté usuarios con botón Privado. Abrí Chat general o tocá Actualizar online.</div>';
      return;
    }
    list.innerHTML = contacts.map(function(c){
      var active = state.active && state.active.id === c.id ? ' vfm-active' : '';
      return '<button class="vfm-contact'+active+'" data-vfm-id="'+safe(c.id)+'"><div class="vfm-avatar">'+safe(initials(c.name))+'</div><div><div class="vfm-name">'+safe(c.name)+'</div><div class="vfm-status on">● En línea</div></div></button>';
    }).join('');
    list.querySelectorAll('[data-vfm-id]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id = btn.getAttribute('data-vfm-id');
        var c = state.contacts.find(function(x){return x.id===id;});
        if(c) openChat(c);
      });
    });
  }

  function openPanel(){
    ensureRoot();
    state.open = true;
    document.getElementById('vfmPanel').classList.add('vfm-open');
    document.getElementById('vfmLauncher').style.display='none';
    renderContacts();
  }
  function closePanel(){
    state.open = false;
    document.getElementById('vfmPanel').classList.remove('vfm-open');
    document.getElementById('vfmLauncher').style.display='inline-block';
  }
  function openChat(contact){
    ensureRoot(); openPanel();
    state.active = contact;
    if(!state.messages[contact.id]) state.messages[contact.id] = [{from:'them', text:'Privado iniciado con '+contact.name+'.'}];
    document.getElementById('vfmChatEmpty').style.display='none';
    document.getElementById('vfmChatBox').style.display='flex';
    document.getElementById('vfmAvatar').textContent = initials(contact.name);
    document.getElementById('vfmTitle').textContent = contact.name;
    document.getElementById('vfmSub').textContent = 'Conversación privada';
    renderContacts(); renderMessages();
    setTimeout(function(){ var input=document.getElementById('vfmInput'); if(input) input.focus(); },50);
  }
  function renderMessages(){
    var box = document.getElementById('vfmMessages');
    if(!box || !state.active) return;
    var arr = state.messages[state.active.id] || [];
    box.innerHTML = arr.map(function(m){ return '<div class="vfm-bubble '+(m.from==='me'?'me':'them')+'">'+safe(m.text)+'</div>'; }).join('');
    box.scrollTop = box.scrollHeight;
  }
  function sendMsg(){
    if(!state.active) return;
    var input = document.getElementById('vfmInput');
    var msg = input.value.trim();
    if(!msg) return;
    state.messages[state.active.id] = state.messages[state.active.id] || [];
    state.messages[state.active.id].push({from:'me', text:msg});
    input.value=''; renderMessages();
  }

  window.openFloatingPrivateMessenger = function(user){
    var c = typeof user === 'object' ? user : { id:idFromName(user), name:txt(user || 'Usuario'), online:true };
    openChat(c);
  };

  document.addEventListener('click', function(e){
    var btn = e.target.closest('button');
    if(!btn) return;
    var label = (btn.innerText || btn.textContent || '').trim();
    if(/^privado$/i.test(label) || /mensaje privado/i.test(label)){
      e.preventDefault(); e.stopPropagation();
      openChat({ id:idFromName(extractNameFromCard(btn)), name:extractNameFromCard(btn), online:true });
    }
  }, true);

  setInterval(function(){ if(state.open) renderContacts(); }, 4000);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureRoot); else ensureRoot();
})();
</script>
<!-- FLOATING_MESSENGER_FINAL_END -->
`;

if (html.includes('</body>')) {
  html = html.replace('</body>', injection + '\n</body>');
} else {
  html += injection;
}

fs.writeFileSync(file, html, 'utf8');
console.log('Listo. Mensajero flotante FINAL aplicado en index.html');
console.log('Backup creado en: ' + path.basename(backup));
console.log('Ahora hacé: git add . && git commit -m "Agregar mensajero flotante final" && git push');

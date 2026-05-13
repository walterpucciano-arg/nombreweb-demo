const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(file)) {
  console.error('No encuentro index.html en esta carpeta. Poné este archivo al lado de index.html y ejecutalo de nuevo.');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');
const backup = path.join(process.cwd(), `index.html.backup-floating-messenger-v4-${Date.now()}`);
fs.writeFileSync(backup, html, 'utf8');

const css = `
<style id="floating-private-messenger-v4-style">
  #vfmMessenger{position:fixed;right:24px;bottom:24px;width:min(860px,calc(100vw - 48px));height:min(620px,calc(100vh - 80px));background:#0e1020;color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:22px;box-shadow:0 28px 90px rgba(0,0,0,.55);z-index:999999;display:none;overflow:hidden;font-family:inherit}
  #vfmMessenger.vfmOpen{display:grid;grid-template-columns:290px 1fr}
  .vfmContacts{background:#111321;border-right:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;min-width:0}
  .vfmHead{height:64px;display:flex;align-items:center;gap:12px;padding:0 16px;border-bottom:1px solid rgba(255,255,255,.10);font-weight:900;letter-spacing:.14em;text-transform:uppercase}
  .vfmClose{width:34px;height:34px;border:0;border-radius:12px;background:rgba(255,255,255,.10);color:#fff;cursor:pointer;font-size:20px}
  .vfmList{overflow:auto;flex:1;padding:8px}
  .vfmContact{display:flex;align-items:center;gap:10px;width:100%;padding:10px;border:0;border-radius:14px;background:transparent;color:#fff;text-align:left;cursor:pointer}
  .vfmContact:hover,.vfmContact.active{background:rgba(255,255,255,.10)}
  .vfmAvatar{width:42px;height:42px;border-radius:999px;background:linear-gradient(135deg,#ec4899,#8b5cf6);display:grid;place-items:center;font-weight:900;flex:0 0 auto;overflow:hidden}
  .vfmAvatar img{width:100%;height:100%;object-fit:cover}
  .vfmMeta{min-width:0;flex:1}.vfmName{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vfmStatus{font-size:12px;color:#a7f3d0;margin-top:2px}.vfmStatus.off{color:#9ca3af}
  .vfmChat{display:flex;flex-direction:column;min-width:0;background:#f3f4f6;color:#111827}
  .vfmChatHead{height:64px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,.10);background:#fff}
  .vfmTitle{display:flex;align-items:center;gap:10px;min-width:0}.vfmTitleText{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vfmTiny{font-size:12px;color:#6b7280;margin-top:2px}.vfmCamBtn{border:0;border-radius:12px;background:#2563eb;color:#fff;padding:10px 14px;font-weight:800;cursor:pointer}
  .vfmMessages{flex:1;overflow:auto;padding:18px;background:#eef0f4}.vfmMsg{max-width:76%;padding:10px 13px;margin:8px 0;border-radius:16px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.06);font-size:14px;line-height:1.35}.vfmMsg.me{margin-left:auto;background:#0ea5e9;color:#fff}.vfmTime{font-size:10px;opacity:.7;margin-left:6px}
  .vfmComposer{display:flex;gap:8px;padding:12px;background:#fff;border-top:1px solid rgba(0,0,0,.10)}.vfmInput{flex:1;border:1px solid #d1d5db;border-radius:14px;padding:12px 14px;font-size:14px}.vfmSend{border:0;border-radius:14px;background:#0ea5e9;color:#fff;padding:0 18px;font-weight:900;cursor:pointer}
  .vfmMiniButton{position:fixed;right:24px;bottom:24px;z-index:999998;border:0;border-radius:999px;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;padding:14px 18px;font-weight:900;box-shadow:0 18px 50px rgba(0,0,0,.35);cursor:pointer;display:none}
  @media(max-width:760px){#vfmMessenger{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 24px);grid-template-columns:1fr}.vfmContacts{display:none}#vfmMessenger.vfmOpen{display:flex}.vfmChat{flex:1}.vfmMsg{max-width:88%}}
</style>`;

const js = `
<script id="floating-private-messenger-v4-script">
(function(){
  if(window.__floatingPrivateMessengerV4) return;
  window.__floatingPrivateMessengerV4 = true;

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>'"]/g, function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];});
  }
  function getName(u){ return (u && (u.alias || u.displayName || u.username || u.name || u.email)) || 'Usuario sin nombre'; }
  function firstLetter(name){ return (name || 'U').trim().charAt(0).toUpperCase() || 'U'; }
  function now(){ return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }

  const state = { users: [], active: null, messages: {} };

  function ensureMessenger(){
    if(document.getElementById('vfmMessenger')) return;
    const mini = document.createElement('button');
    mini.id = 'vfmMiniButton';
    mini.className = 'vfmMiniButton';
    mini.textContent = '💬 Privados';
    mini.onclick = function(){ openMessenger(state.active || state.users[0] || null); };
    document.body.appendChild(mini);

    const wrap = document.createElement('div');
    wrap.id = 'vfmMessenger';
    wrap.innerHTML = '<section class="vfmContacts"><div class="vfmHead"><button class="vfmClose" type="button" id="vfmClose">×</button><span>Contactos</span></div><div class="vfmList" id="vfmList"></div></section><section class="vfmChat"><div class="vfmChatHead"><div class="vfmTitle"><div class="vfmAvatar" id="vfmHeaderAvatar">U</div><div><div class="vfmTitleText" id="vfmHeaderName">Seleccioná un usuario</div><div class="vfmTiny" id="vfmHeaderStatus">Conversación privada</div></div></div><button class="vfmCamBtn" type="button" id="vfmCamBtn">📹 Cámara</button></div><div class="vfmMessages" id="vfmMessages"></div><div class="vfmComposer"><input class="vfmInput" id="vfmInput" placeholder="Escribe un mensaje aquí..."/><button class="vfmSend" id="vfmSend" type="button">➤</button></div></section>';
    document.body.appendChild(wrap);
    document.getElementById('vfmClose').onclick = closeMessenger;
    document.getElementById('vfmSend').onclick = sendPrivateMessage;
    document.getElementById('vfmInput').addEventListener('keydown', function(e){ if(e.key === 'Enter') sendPrivateMessage(); });
    document.getElementById('vfmCamBtn').onclick = function(){ alert('Solicitud de cámara privada para ' + (state.active ? getName(state.active) : 'usuario')); };
  }

  function closeMessenger(){
    const m = document.getElementById('vfmMessenger');
    const b = document.getElementById('vfmMiniButton');
    if(m) m.classList.remove('vfmOpen');
    if(b) b.style.display = 'block';
  }

  function openMessenger(user){
    ensureMessenger();
    const m = document.getElementById('vfmMessenger');
    const b = document.getElementById('vfmMiniButton');
    if(user) state.active = normalizeUser(user);
    if(state.active && !state.users.find(function(x){ return String(x.id) === String(state.active.id); })) state.users.unshift(state.active);
    m.classList.add('vfmOpen');
    b.style.display = 'none';
    renderContacts();
    renderChat();
  }

  function normalizeUser(u){
    if(!u) return null;
    if(typeof u === 'string') return {id:u, alias:u, online:true};
    return {
      id: u.id || u.user_id || u.uuid || u.email || getName(u),
      alias: getName(u),
      email: u.email || '',
      avatar: u.avatar || u.photo || u.photo_url || u.image || u.profile_image || '',
      online: u.online !== false && u.status !== 'offline' && u.status !== 'Desconectado',
      webcam_enabled: !!(u.webcam_enabled || u.camera || u.camera_on || u.cam)
    };
  }

  function renderContacts(){
    const list = document.getElementById('vfmList');
    if(!list) return;
    const users = state.users.length ? state.users : (state.active ? [state.active] : []);
    list.innerHTML = users.map(function(u){
      const active = state.active && String(state.active.id) === String(u.id) ? ' active' : '';
      const avatar = u.avatar ? '<img src="'+esc(u.avatar)+'" alt="">' : esc(firstLetter(getName(u)));
      return '<button type="button" class="vfmContact'+active+'" data-vfm-id="'+esc(u.id)+'"><div class="vfmAvatar">'+avatar+'</div><div class="vfmMeta"><div class="vfmName">'+esc(getName(u))+'</div><div class="vfmStatus '+(u.online?'':'off')+'">'+(u.online?'En línea':'Desconectado')+'</div></div>'+(u.webcam_enabled?'📷':'')+'</button>';
    }).join('');
    list.querySelectorAll('[data-vfm-id]').forEach(function(btn){
      btn.onclick = function(){ state.active = users.find(function(u){ return String(u.id) === String(btn.dataset.vfmId); }); renderContacts(); renderChat(); };
    });
  }

  function renderChat(){
    const u = state.active;
    const nameEl = document.getElementById('vfmHeaderName');
    const stEl = document.getElementById('vfmHeaderStatus');
    const avEl = document.getElementById('vfmHeaderAvatar');
    const msgEl = document.getElementById('vfmMessages');
    if(!nameEl || !msgEl) return;
    if(!u){ nameEl.textContent = 'Seleccioná un usuario'; stEl.textContent = 'Conversación privada'; avEl.textContent = 'U'; msgEl.innerHTML = '<div class="vfmTiny">Elegí un contacto para empezar.</div>'; return; }
    nameEl.textContent = getName(u);
    stEl.textContent = u.online ? 'En línea · conversación privada' : 'Desconectado · conversación privada';
    avEl.innerHTML = u.avatar ? '<img src="'+esc(u.avatar)+'" alt="">' : esc(firstLetter(getName(u)));
    const key = String(u.id);
    const arr = state.messages[key] || [];
    msgEl.innerHTML = arr.length ? arr.map(function(m){ return '<div class="vfmMsg '+(m.me?'me':'')+'">'+esc(m.text)+' <span class="vfmTime">'+esc(m.time)+'</span></div>'; }).join('') : '<div class="vfmTiny">Todavía no hay mensajes con '+esc(getName(u))+'.</div>';
    msgEl.scrollTop = msgEl.scrollHeight;
  }

  function sendPrivateMessage(){
    const input = document.getElementById('vfmInput');
    if(!input || !state.active) return;
    const text = input.value.trim();
    if(!text) return;
    const key = String(state.active.id);
    state.messages[key] = state.messages[key] || [];
    state.messages[key].push({text:text, me:true, time:now()});
    input.value = '';
    renderChat();
    try{
      if(window.socket && typeof window.socket.emit === 'function') window.socket.emit('private_message', {to: state.active.id, text:text});
      if(window.supabase) console.log('Mensaje privado local. Conectar acá con Supabase si corresponde.', {to: state.active.id, text:text});
    }catch(e){ console.warn(e); }
  }

  window.openFloatingPrivateMessenger = function(userOrId, alias){
    const user = typeof userOrId === 'object' ? userOrId : {id:userOrId, alias:alias || userOrId, online:true};
    openMessenger(user);
  };
  window.startPrivateChat = function(userId, alias){ window.openFloatingPrivateMessenger(userId, alias); };
  window.openPrivateChat = function(userId, alias){ window.openFloatingPrivateMessenger(userId, alias); };

  window.setFloatingMessengerUsers = function(users){
    state.users = (users || []).map(normalizeUser).filter(Boolean);
    if(state.active){
      const refreshed = state.users.find(function(u){ return String(u.id) === String(state.active.id); });
      if(refreshed) state.active = refreshed;
    }
    renderContacts();
  };

  document.addEventListener('click', function(e){
    const el = e.target.closest('button, a, [role="button"], .user, .onlineUser, .person, .member');
    if(!el) return;
    const txt = (el.textContent || '').toLowerCase();
    const isPrivate = txt.includes('privado') || txt.includes('mensaje') || txt.includes('chat');
    if(!isPrivate) return;
    const row = el.closest('[data-user-id], [data-id], .user, .onlineUser, .person, .member') || el;
    const id = row.getAttribute('data-user-id') || row.getAttribute('data-id') || row.dataset.userId || row.dataset.id || row.dataset.uid || (el.onclick ? '' : 'usuario');
    const alias = row.getAttribute('data-alias') || row.getAttribute('data-name') || row.dataset.alias || row.dataset.name || (row.innerText || el.innerText || 'Usuario').trim().split('\n')[0];
    if(id || alias){
      e.preventDefault();
      e.stopPropagation();
      openMessenger({id:id || alias, alias:alias || id, online:true});
    }
  }, true);

  ensureMessenger();
})();
</script>`;

if (!html.includes('floating-private-messenger-v4-style')) {
  html = html.replace('</head>', css + '\n</head>');
}
if (!html.includes('floating-private-messenger-v4-script')) {
  html = html.replace('</body>', js + '\n</body>');
}

// Mejoras opcionales sobre llamadas existentes
html = html.replace(/window\.open\(([^)]*)\)/g, 'window.open($1)');

fs.writeFileSync(file, html, 'utf8');
console.log('Listo. Hotfix V4 aplicado en index.html');
console.log('Backup creado en: ' + path.basename(backup));
console.log('Ahora hacé: git add . && git commit -m "Agregar mensajero privado flotante V4" && git push');

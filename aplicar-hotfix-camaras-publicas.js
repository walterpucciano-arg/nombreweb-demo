#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'index.html');
if (!fs.existsSync(file)) {
  console.error('No encuentro index.html. Ejecutá este script dentro de la carpeta raíz del proyecto.');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');
const backup = path.join(process.cwd(), `index.backup-camaras-publicas-${Date.now()}.html`);
fs.writeFileSync(backup, html, 'utf8');

function replaceAllSafe(from, to) {
  if (html.includes(from)) html = html.split(from).join(to);
}

// 1) Helper para evitar “Usuario” genérico cuando existe email/nombre.
if (!html.includes('function profileDisplayName(p)')) {
  const marker = 'function renderOnlineUsers(){';
  const helper = `
function profileDisplayName(p){
  return (p?.alias || p?.username || p?.name || p?.email || 'Usuario sin nombre');
}
`;
  html = html.replace(marker, helper + '\n' + marker);
}

// 2) Reemplazos específicos de nombres en zonas críticas.
replaceAllSafe("p.alias||'Usuario'", "profileDisplayName(p)");
replaceAllSafe("p.alias || 'Usuario'", "profileDisplayName(p)");
replaceAllSafe("p.alias||'U'", "profileDisplayName(p)||'U'");
replaceAllSafe("(p.alias||'U').slice", "(profileDisplayName(p)||'U').slice");

// 3) Botones de cámara pública: en chat general ya NO mandan solicitud.
html = html.replace(/onclick="sendCameraRequest\('\$\{p\.id\}','\$\{esc\(profileDisplayName\(p\)\)\}'\)">Ver CAM/g, "onclick=\"watchPublicCamera('${p.id}','${esc(profileDisplayName(p))}')\">📷");
html = html.replace(/onclick="sendCameraRequest\('\$\{p\.id\}','\$\{esc\(profileDisplayName\(p\)\)\}'\)">Ver cámara/g, "onclick=\"watchPublicCamera('${p.id}','${esc(profileDisplayName(p))}')\">Ver cámara");
html = html.replace(/onclick="sendCameraRequest\('\$\{p\.id\}','\$\{esc\(profileDisplayName\(p\)\)\}'\)">Ver CAM/g, "onclick=\"watchPublicCamera('${p.id}','${esc(profileDisplayName(p))}')\">📷");

// Fallback para código original si no fue alcanzado por el reemplazo anterior.
html = html.replace(/onclick="sendCameraRequest\('\$\{p\.id\}','\$\{esc\(p\.alias\|\|'Usuario'\)\}'\)">Ver CAM/g, "onclick=\"watchPublicCamera('${p.id}','${esc(profileDisplayName(p))}')\">📷");
html = html.replace(/onclick="sendCameraRequest\('\$\{p\.id\}','\$\{esc\(p\.alias\|\|'Usuario'\)\}'\)">Ver cámara/g, "onclick=\"watchPublicCamera('${p.id}','${esc(profileDisplayName(p))}')\">Ver cámara");

// 4) Modal de perfil: si toca cámara desde perfil público, abre cámara pública si está activa.
html = html.replace(/modalCamBtn\.onclick=\(\)=>sendCameraRequest\(p\.id,profileDisplayName\(p\)\)/g, "modalCamBtn.onclick=()=>watchPublicCamera(p.id,profileDisplayName(p))");
html = html.replace(/modalCamBtn\.onclick=\(\)=>sendCameraRequest\(p\.id,p\.alias\|\|'Usuario'\)/g, "modalCamBtn.onclick=()=>watchPublicCamera(p.id,profileDisplayName(p))");

// 5) Reemplazar renderGeneralCameraSlots por lógica elegible: muestra disponibles, pero el usuario elige a quién mirar.
const start = html.indexOf('async function renderGeneralCameraSlots()');
const end = html.indexOf('async function sendCameraRequest', start);
if (start !== -1 && end !== -1) {
  const replacement = `async function renderGeneralCameraSlots(){
  const camUsers = (profiles||[]).filter(p=>p.webcam_enabled).slice(0,3);
  const camBoxes = document.querySelectorAll('.cams .cam');
  if(!camBoxes.length) return;

  for(let i=0;i<Math.min(3,camBoxes.length);i++){
    const p = camUsers[i];
    if(p){
      camBoxes[i].classList.add('cameraSlotActive');
      camBoxes[i].innerHTML = \`
        <div class="slot">
          <div>
            <div class="webcamStatus">CÁMARA DISPONIBLE</div>
            <div style="font-size:42px;margin-bottom:8px">📷</div>
            <b>\${esc(profileDisplayName(p))}</b><br>
            <small>\${esc(p.city||'')}</small>
            <div class="toolRow" style="justify-content:center">
              <button class="primary" onclick="watchPublicCamera('\${p.id}','\${esc(profileDisplayName(p))}')">Ver cámara</button>
              <button onclick="startPrivateChat('\${p.id}','\${esc(profileDisplayName(p))}')">Privado</button>
            </div>
          </div>
        </div>\`;
    }else{
      camBoxes[i].classList.remove('cameraSlotActive');
      camBoxes[i].innerHTML='<div class="slot"> Espacio disponible<br><small>Usuarios con cámara activa</small></div>';
    }
  }

  if(localStream){
    const first=camBoxes[0];
    if(first){
      first.classList.add('cameraSlotActive');
      first.innerHTML='<video id="localVideo" autoplay muted playsinline></video><div class="overlay"></div><div class="camInfo"><span class="badge bPink">TU CAM</span></div>';
      setTimeout(()=>{const v=document.getElementById('localVideo');if(v)v.srcObject=localStream;},50);
    }
  }
}

function watchPublicCamera(userId,alias){
  const p = (profiles||[]).find(x=>x.id===userId) || (allProfiles||[]).find(x=>x.id===userId);
  const display = alias || profileDisplayName(p) || 'Usuario sin nombre';
  const camBoxes = document.querySelectorAll('.cams .cam');
  const mainBox = camBoxes[0];
  if(!mainBox) return;

  if(!p?.webcam_enabled){
    setResult && setResult('statusResult','Ese usuario no tiene la cámara pública activa en este momento.');
    showToast && showToast('Cámara','Ese usuario apagó la cámara.');
    renderGeneralCameraSlots();
    return;
  }

  if(typeof chatTitle !== 'undefined' && chatTitle) chatTitle.textContent = 'Cámara pública de ' + display;
  if(typeof chatSub !== 'undefined' && chatSub) chatSub.textContent = 'Transmisión pública disponible. No requiere solicitud.';

  mainBox.classList.add('cameraSlotActive');
  mainBox.innerHTML = \`
    <div class="slot">
      <div>
        <div class="webcamStatus">CÁMARA PÚBLICA</div>
        <div style="font-size:48px;margin:10px 0">📷</div>
        <b>\${esc(display)}</b><br>
        <small>Usuario con cámara activa en sala general</small>
        <div class="toolRow" style="justify-content:center;margin-top:12px">
          <button onclick="closePublicCamera()">Cerrar cámara</button>
          <button class="primary" onclick="startPrivateChat('\${userId}','\${esc(display)}')">Privado</button>
        </div>
      </div>
    </div>\`;

  setResult && setResult('statusResult','Viendo cámara pública de '+display+' ✅',true);
}

function closePublicCamera(){
  if(typeof chatTitle !== 'undefined' && chatTitle) chatTitle.textContent = 'Sala general';
  if(typeof chatSub !== 'undefined' && chatSub) chatSub.textContent = 'Chat estable';
  renderGeneralCameraSlots();
}

`;
  html = html.slice(0, start) + replacement + html.slice(end);
} else {
  console.warn('No pude reemplazar renderGeneralCameraSlots automáticamente. Revisar manualmente.');
}

// 6) Ajuste textual de README interno si aparece.
html = html.replace(/Botón “Ver CAM” envía solicitud\./g, 'Botón “📷 / Ver cámara” abre cámara pública disponible en sala general.');

fs.writeFileSync(file, html, 'utf8');
console.log('Hotfix aplicado correctamente.');
console.log('Backup creado en:', backup);
console.log('Ahora probá: npm run build');

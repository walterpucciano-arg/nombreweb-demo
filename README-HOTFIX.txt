HOTFIX — Cámaras públicas elegibles + nombres correctos

Qué hace:
1. En la lista online, los usuarios con cámara activa muestran ícono 📷.
2. Tocar 📷 ya NO manda solicitud en chat general.
3. Abre la cámara pública disponible dentro de la sala general.
4. Si no querés mirar cámaras, no se abre ninguna automáticamente.
5. La solicitud de cámara queda para el chat privado.
6. Corrige nombres: usa alias, username, name, email o “Usuario sin nombre”.
7. Reemplaza la lógica de renderGeneralCameraSlots para mostrar cámaras disponibles y botón Ver cámara.

Cómo aplicarlo:
1. Descomprimí este ZIP.
2. Copiá aplicar-hotfix-camaras-publicas.js dentro de la carpeta raíz de tu proyecto, donde está index.html.
3. Abrí terminal en esa carpeta.
4. Ejecutá:
   node aplicar-hotfix-camaras-publicas.js
5. Probá:
   npm run build
6. Subí los cambios a GitHub:
   git add .
   git commit -m "Hotfix cámaras públicas elegibles"
   git push

El script crea backup automático del index.html antes de modificarlo.

Importante:
Este hotfix corrige la UX/lógica de selección de cámaras públicas, pero no convierte mágicamente la cámara remota en video real si todavía no está implementado WebRTC completo con offer/answer/candidates/STUN/TURN. Para video remoto real entre usuarios, hay que terminar esa parte técnica aparte.

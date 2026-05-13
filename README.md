# Velvet Hotfix — Privado + Cámara

Corrige:
- Usuario online aparece pero no inicia chat privado.
- Al tocar “Privado” abre la conversación privada en la pantalla de chat.
- Lista de online ahora tiene botón explícito “Privado”.
- Si un usuario activa webcam, aparece como CAM en sala general.
- Botón “Ver CAM” envía solicitud.
- Usuario receptor ve solicitud y puede aceptar/rechazar.
- Base de señalización WebRTC queda preparada.

## Importante sobre cámaras reales
Este hotfix muestra presencia de cámara y flujo de solicitud/aceptación.
Para ver video remoto real entre dos usuarios hace falta WebRTC completo con offer/answer/candidates y, en producción, STUN/TURN.

## Pasos
1. Ejecutar `SUPABASE-HOTFIX-PRIVATE-CHAT-CAMERA.sql`.
2. Reemplazar `index.html`.
3. Commit/push.
4. CTRL + F5.
5. Probar con dos usuarios:
   - ambos online
   - tocar Privado
   - enviar mensaje
   - activar cámara
   - solicitar cámara
   - aceptar solicitud

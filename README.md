# 🏛️ BioID Congreso

Plataforma de seguridad e identidades del Congreso. Autenticación avanzada (Multifactor) con soporte predictivo de voz y biometría, apoyado por inteligencia artificial.

## 📌 Descripción
BioID Congreso es un sistema web moderno diseñado bajo estigmas estéticos minimalistas tipo iOS Premium. Integra acceso tradicional, cámara web para reconocimiento de puntos faciales simulado y autenticación de voz usando modelos de *Teachable Machine* integrados en el navegador con TensorFlow.js.
Todo centralizado y persistente gracias a la conexión con **Supabase**, además de incorporar un asistente conversacional inteligente impulsado por **VAPI AI**.

## 🛠️ Tecnologías
- **Frontend Core**: Vanilla JS, Vanilla CSS, HTML5.
- **Base de Datos & Auth**: [Supabase](https://supabase.com/) (Data persistence y SQL puro).
- **Inteligencia Artificial (Audio)**: [TensorFlow.js](https://www.tensorflow.org/js) y Speech Commands.
- **Modelo Acústico**: [Teachable Machine by Google](https://teachablemachine.withgoogle.com/).
- **Asistente Virtual**: [VAPI AI Widget Component](https://vapi.ai/).
- **Organización**: Estructura _plana_ orientada hacia facilitación en despliegue.

## ⚙️ Instalación
Este proyecto tiene una estructura 100% plana diseñada para lanzarlo directamente desde la raíz o subirlo automáticamente a **GitHub Pages** sin configuraciones molestas de Webpack u otros bundlers.

1. **Clona o guarda** este proyecto en un directorio.
2. Abre la consola en este directorio y utiliza un servidor local sencillo (como serve, live-server o python). Ejemplo:
   ```bash
   npx serve .
   ```
3. Alternativamente, simplemente subir todos los archivos a GitHub y activar GitHub Pages apuntando a `/root`. Todo correrá gracias a los enlaces relativos `.` y CDN.

## 🚀 Uso
- **Registrarse:** Ingresa datos falsos o de prueba y haz clic en Capturar. Simulamos enviar estos datos hacia `Supabase` (debes configurar la tabla `usuarios` previamente con el script SQL provisto).
- **Inicio de sesión (Login):** Ingresa los datos. Luego te pedirá el rostro y al final pronunciar "bolívar". 
- **Modo Administrador:** Si entras con `admin` y `123456`, evitarás el flujo biométrico pudiendo visualizar la consola de operaciones y tableros estadísticos en vida real.
- **Soporte IA (Manuela):** En la esquina derecha en cada página tendrás a Manuela de VAPI lista para ayudarte.

--- 
*Generado mediante Antigravity*

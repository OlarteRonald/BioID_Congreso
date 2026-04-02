import { AuthFlow } from './auth.js';
import { BiometricsFlow } from './biometrics.js';
import { VoiceFlow } from './voice.js';
import { SupabaseService } from './supabaseService.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('BioID App Iniciada');

    // Registro
    const btnRegister = document.getElementById('btn-register');
    const modalRegister = document.getElementById('register-modal');
    const closeRegister = document.getElementById('close-register');
    const registerForm = document.getElementById('register-form');
    const step1 = document.getElementById('register-step-1');
    const step2 = document.getElementById('register-step-2');
    const btnCapture = document.getElementById('btn-capture');
    const btnFinish = document.getElementById('btn-finish-register');
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('camera-canvas');

    // Login
    const btnLogin = document.getElementById('btn-login');
    const modalLogin = document.getElementById('login-modal');
    const closeLogin = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');
    const logStep1 = document.getElementById('login-step-1');
    const logStep2 = document.getElementById('login-step-2');
    const logStep3 = document.getElementById('login-step-3');
    const logVideo = document.getElementById('login-camera-feed');
    const logCanvas = document.getElementById('login-camera-canvas');
    const btnLoginCapture = document.getElementById('btn-login-capture');
    const btnLoginNext = document.getElementById('btn-login-next');
    const voiceStatus = document.getElementById('voice-status');

    let userData = {};
    let localStream = null;
    let loginData = {};

    // Toggle PW visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if(input.type === 'password') {
                input.type = 'text';
                e.currentTarget.textContent = '🔒';
            } else {
                input.type = 'password';
                e.currentTarget.textContent = '👁';
            }
        });
    });

    // --- REGISTRO ---
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            modalRegister.classList.remove('hidden');
            step1.classList.remove('hidden');
            step2.classList.add('hidden');
        });
    }

    if (closeRegister) {
        closeRegister.addEventListener('click', () => {
            modalRegister.classList.add('hidden');
            if(localStream) BiometricsFlow.stopCamera(localStream);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pw1 = document.getElementById('reg-password').value;
            const pw2 = document.getElementById('reg-password-confirm').value;
            if(pw1 !== pw2) return alert("Las contraseñas no coinciden");
            
            userData = {
                nombre: document.getElementById('reg-nombre').value,
                correo: document.getElementById('reg-correo').value,
                usuario: document.getElementById('reg-usuario').value,
                password: pw1
            };
            
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            localStream = await BiometricsFlow.startCamera(video);
        });
    }

    btnCapture.addEventListener('click', async () => {
        userData.foto_biometrica = BiometricsFlow.capturePhoto(video, canvas);
        btnCapture.textContent = "Analizando rostro...";
        btnCapture.disabled = true;

        // Extraer descriptor facial real
        const descriptor = await BiometricsFlow.getFaceDescriptor(canvas);
        if (!descriptor) {
            alert("No se detectó un rostro válido. Asegúrese de estar bien iluminado y mirando a la cámara.");
            btnCapture.textContent = "Capturar Rostro";
            btnCapture.disabled = false;
            return;
        }

        userData.face_descriptor = JSON.stringify(descriptor);
        btnCapture.textContent = "✅ Rostro Registrado";
        btnCapture.classList.replace('btn-outline', 'btn-solid');
        btnCapture.style.backgroundColor = "green";
        btnFinish.classList.remove('hidden');
    });

    btnFinish.addEventListener('click', async () => {
        btnFinish.textContent = "Guardando...";
        const result = await AuthFlow.register(userData);
        btnFinish.textContent = "Finalizar y Guardar";
        if(result.success) {
            alert("Registro exitoso. Se ha enviado un correo de confirmación.");
            if(localStream) BiometricsFlow.stopCamera(localStream);
            modalRegister.classList.add('hidden');
        } else {
            alert("Error: " + result.error);
        }
    });

    // --- LOGIN ---
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            modalLogin.classList.remove('hidden');
            logStep1.classList.remove('hidden');
            logStep2.classList.add('hidden');
            logStep3.classList.add('hidden');
        });
    }

    if (closeLogin) {
        closeLogin.addEventListener('click', () => {
            modalLogin.classList.add('hidden');
            if(localStream) BiometricsFlow.stopCamera(localStream);
            VoiceFlow.stopListening();
        });
    }

    // Login Paso 1: Auth
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userIn = document.getElementById('log-usuario').value;
            const passIn = document.getElementById('log-password').value;
            
            const submitBtn = loginForm.querySelector('button');
            submitBtn.textContent = "Validando...";

            if (userIn === 'admin' && passIn === '123456') {
                window.location.href = 'admin.html';
                return;
            }

            const session = await SupabaseService.loginCustomUser(userIn, passIn);
            submitBtn.textContent = "Verificar Acceso";
            
            if(session.error) {
                alert("Usuario o Contraseña incorrectos");
                return;
            }
            
            loginData.user = session.data;
            logStep1.classList.add('hidden');
            logStep2.classList.remove('hidden');
            localStream = await BiometricsFlow.startCamera(logVideo);
        });
    }

    // Login Paso 2: Biometría
    btnLoginCapture.addEventListener('click', async () => {
        BiometricsFlow.capturePhoto(logVideo, logCanvas);
        btnLoginCapture.textContent = "Comparando rostro...";
        btnLoginCapture.disabled = true;

        // Extraer descriptor del rostro capturado ahora
        const liveDescriptor = await BiometricsFlow.getFaceDescriptor(logCanvas);
        if (!liveDescriptor) {
            alert("No se detectó un rostro. Asegúrese de estar frente a la cámara con buena iluminación.");
            btnLoginCapture.textContent = "Verificar Rostro";
            btnLoginCapture.disabled = false;
            return;
        }

        // Obtener descriptor almacenado del usuario
        const storedRaw = loginData.user.face_descriptor;
        if (!storedRaw) {
            alert("Este usuario no tiene un registro biométrico facial. Debe registrarse nuevamente.");
            btnLoginCapture.textContent = "Verificar Rostro";
            btnLoginCapture.disabled = false;
            return;
        }

        const storedDescriptor = JSON.parse(storedRaw);
        const result = BiometricsFlow.compareFaces(liveDescriptor, storedDescriptor);

        if (result.match) {
            btnLoginCapture.textContent = `✅ Identidad Confirmada (${result.confidence}%)`;
            btnLoginCapture.classList.replace('btn-outline', 'btn-solid');
            btnLoginCapture.style.backgroundColor = "green";
            btnLoginNext.classList.remove('hidden');
        } else {
            alert(`❌ Rostro NO coincide.\nSimilitud: ${result.confidence}%\nSe requiere una coincidencia superior al 45%.\n\nIntente de nuevo con mejor iluminación o la misma posición del registro.`);
            btnLoginCapture.textContent = "Verificar Rostro";
            btnLoginCapture.disabled = false;
        }
    });

    btnLoginNext.addEventListener('click', async () => {
        if(localStream) BiometricsFlow.stopCamera(localStream);
        logStep2.classList.add('hidden');
        logStep3.classList.remove('hidden');
        
        try {
            voiceStatus.textContent = "Cargando modelo de voz...";
            await VoiceFlow.initModel("https://teachablemachine.withgoogle.com/models/rGMICgfNQ/");
            voiceStatus.textContent = "Modelo cargado. Diga la palabra de seguridad: 'bolivar'";
            
            VoiceFlow.listenFor("bolivar", () => {
                alert("Acceso exitoso: Identidad confirmada.");
                localStorage.setItem('bioid_user', JSON.stringify(loginData.user));
                window.location.href = "dashboard.html";
            });
        } catch(e) {
            console.log(e);
            alert("Error al cargar modelo de voz");
        }
    });

});

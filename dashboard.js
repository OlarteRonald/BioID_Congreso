import { SupabaseService } from './supabaseService.js';
import { VoiceFlow } from './voice.js';

document.addEventListener('DOMContentLoaded', async () => {

    const userRaw = localStorage.getItem('bioid_user');
    if(!userRaw) {
        window.location.href = "index.html";
        return;
    }
    
    const user = JSON.parse(userRaw);
    let currentSessionId = null;

    // 1. Mostrar nombre arriba derecha
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = user.nombre || user.usuario;

    // 2. Fecha actual
    const dateEl = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-ES', options).toUpperCase();

    // 3. Registrar Inicio en BD (tabla sesiones)
    try {
        const result = await SupabaseService.startSession(user.id);
        if(result.error) {
            console.error("Error al registrar sesión BD", result.error);
        } else {
            console.log("Sesión activa en BD, ID:", result.data.id);
            currentSessionId = result.data.id;
        }
    } catch(err) {
        console.log("Supabase Mock/Error al crear sesión:", err);
    }

    // 4. Cronómetro en tiempo real
    const chronoEl = document.getElementById('chrono');
    let secondsTotal = 0;
    
    function updateTimer() {
        secondsTotal++;
        const h = Math.floor(secondsTotal / 3600).toString().padStart(2, '0');
        const m = Math.floor((secondsTotal % 3600) / 60).toString().padStart(2, '0');
        const s = (secondsTotal % 60).toString().padStart(2, '0');
        chronoEl.textContent = `${h}:${m}:${s}`;
    }
    
    const timerInterval = setInterval(updateTimer, 1000);

    // 5. Notas Functionality
    const notesArea = document.getElementById('notes-area');
    const btnSaveNotes = document.getElementById('btn-save-notes');
    
    const savedNotes = localStorage.getItem(`bioid_notes_${user.id}`);
    if (savedNotes) notesArea.value = savedNotes;

    btnSaveNotes.addEventListener('click', () => {
        localStorage.setItem(`bioid_notes_${user.id}`, notesArea.value);
        const originalText = btnSaveNotes.textContent;
        btnSaveNotes.textContent = "✅ Guardado!";
        setTimeout(() => {
            btnSaveNotes.textContent = originalText;
        }, 2000);
    });

    // Logout Helper
    const logoutSession = async () => {
        clearInterval(timerInterval);
        if (currentSessionId) {
            await SupabaseService.endSession(currentSessionId, secondsTotal);
        }
        localStorage.removeItem('bioid_user');
        window.location.href = "index.html";
    };

    // Logout Click
    document.getElementById('btn-logout').addEventListener('click', logoutSession);

    // 6. Botón Flotante para Comandos de Voz ("Caldas")
    const btnFloatingMic = document.getElementById('btn-floating-mic');
    if (btnFloatingMic) {
        btnFloatingMic.addEventListener('click', async () => {
            btnFloatingMic.classList.add('listening');
            
            try {
                await VoiceFlow.initModel("https://teachablemachine.withgoogle.com/models/rGMICgfNQ/");
                
                VoiceFlow.listenFor("caldas", async () => {
                    VoiceFlow.stopListening();
                    btnFloatingMic.classList.remove('listening');
                    btnFloatingMic.textContent = "✅";
                    
                    alert("Comando detectado ('Caldas'). Finalizando sesión segura y guardando datos en la BD.");
                    await logoutSession();
                });
            } catch (e) {
                console.error("Error cargando modelo de voz:", e);
                btnFloatingMic.classList.remove('listening');
            }
        });
    }
});

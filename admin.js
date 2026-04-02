export const AdminDashboard = {
    init() {
        console.log("Panel admin inicializado");
        this.simulateRealtime();
    },

    simulateRealtime() {
        const liveUsersEl = document.getElementById('live-users');
        const intentosCountEl = document.getElementById('intentos-count');
        const registrosList = document.getElementById('registros-list');
        const sesionesList = document.getElementById('sesiones-list');

        let activeUsers = 84;
        let authFailures = 3;

        // Actualizar datos live
        setInterval(() => {
            const variacion = Math.floor(Math.random() * 5) - 2; // -2 to +2
            if(activeUsers + variacion > 0) activeUsers += variacion;
            liveUsersEl.textContent = `${activeUsers} Válidos`;

            // Simulacion de registros incidentales
            if(Math.random() > 0.8) {
                authFailures += 1;
                if(intentosCountEl) intentosCountEl.textContent = authFailures;
                
                const li = document.createElement('li');
                li.style.padding = "10px 0";
                li.style.borderBottom = "1px solid #222";
                li.innerHTML = `<span style="color:#e74c3c;">[${new Date().toLocaleTimeString('es-CO')}]</span> Error: Patrón de voz no coincide.`;
                
                if (registrosList) {
                    registrosList.prepend(li);
                    if(registrosList.children.length > 5) {
                        registrosList.removeChild(registrosList.lastChild);
                    }
                }
            }
        }, 5000);

        // Llenar Registros Init
        if (registrosList) {
            registrosList.innerHTML = `
                <li style="padding:10px 0; border-bottom:1px solid #222;"><span style="color:#2ecc71;">[08:15:02]</span> Ingreso: Sesión acústica verificada (Bolívar)</li>
                <li style="padding:10px 0; border-bottom:1px solid #222;"><span style="color:#2ecc71;">[08:12:45]</span> Ingreso: Verificación facial 99.8% match</li>
                <li style="padding:10px 0; border-bottom:1px solid #222;"><span style="color:#f1c40f;">[08:10:11]</span> Warning: Contraseña reenviada a correo</li>
            `;
        }
        
        // Llenar Sesiones
        if (sesionesList) {
            sesionesList.innerHTML = `
                <li style="padding:8px 0; border-bottom:1px solid #222; display:flex; justify-content:space-between;"><span>Duración Promedio:</span> <strong style="color:#fff;">4h 15m</strong></li>
                <li style="padding:8px 0; border-bottom:1px solid #222; display:flex; justify-content:space-between;"><span>Sesiones (Hoy):</span> <strong style="color:#fff;">124</strong></li>
                <li style="padding:8px 0; border-bottom:1px solid #222; display:flex; justify-content:space-between;"><span>Tasa de Éxito Auth:</span> <strong style="color:var(--color-gold);">98.2%</strong></li>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});

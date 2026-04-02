import { SupabaseService } from './supabaseService.js';

export const AdminDashboard = {
    async init() {
        console.log("Panel admin real inicializado");
        await this.loadDatatables();
    },

    formatDate(isoString) {
        if (!isoString) return '<span style="color:#666;">En Actividad</span>';
        const d = new Date(isoString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    },

    formatDuration(seconds) {
        if (seconds == null) return '<span style="color:#666;">--</span>';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    },

    async loadDatatables() {
        const uTable = document.getElementById('usuarios-table-body');
        const sTable = document.getElementById('sesiones-table-body');
        const userSelect = document.getElementById('select-user');
        
        let localUsers = [];
        let localSessions = [];

        try {
            // Fetch users
            const usersRes = await SupabaseService.getAllUsers();
            if (usersRes.data) {
                localUsers = usersRes.data;
                uTable.innerHTML = '';
                
                if(localUsers.length === 0) {
                    uTable.innerHTML = '<tr><td colspan="4" style="padding:15px;">No hay usuarios registrados.</td></tr>';
                }

                localUsers.forEach(u => {
                    // Populate Table
                    uTable.innerHTML += `
                        <tr style="border-bottom: 1px solid #222;">
                            <td style="padding:12px; color:#aaa;">${this.formatDate(u.fecha_registro)}</td>
                            <td style="padding:12px; font-weight:500; color:#fff;">${u.nombre}</td>
                            <td style="padding:12px; color:#aaa;">${u.correo}</td>
                            <td style="padding:12px; color:var(--color-gold);">${u.usuario}</td>
                        </tr>
                    `;

                    // Populate Dropdown
                    const opt = document.createElement('option');
                    opt.value = u.id;
                    opt.textContent = `${u.nombre} (@${u.usuario})`;
                    if (userSelect) userSelect.appendChild(opt);
                });
            }

            // Fetch sessions
            const sessRes = await SupabaseService.getAllSessions();
            if (sessRes.data) {
                localSessions = sessRes.data;
                sTable.innerHTML = '';

                if(localSessions.length === 0) {
                    sTable.innerHTML = '<tr><td colspan="4" style="padding:15px;">No hay historial de sesiones.</td></tr>';
                }

                localSessions.forEach(s => {
                    const nombreRef = s.usuarios?.nombre || "Usuario Desconocido";
                    
                    sTable.innerHTML += `
                        <tr style="border-bottom: 1px solid #222;">
                            <td style="padding:12px; font-weight:500; color:#fff;">${nombreRef}</td>
                            <td style="padding:12px; color:#2ecc71;">${this.formatDate(s.fecha_inicio)}</td>
                            <td style="padding:12px; color:#e74c3c;">${this.formatDate(s.fecha_fin)}</td>
                            <td style="padding:12px; color:var(--color-gold); font-weight:600;">${this.formatDuration(s.duracion)}</td>
                        </tr>
                    `;
                });
            }

            // Live User Badge update
            const liveBadge = document.getElementById('live-users');
            if (liveBadge) {
                const active = localSessions.filter(s => !s.fecha_fin).length;
                liveBadge.textContent = `${active} en Actividad`;
            }

            // Bind Dropdown logic
            if (userSelect) {
                userSelect.addEventListener('change', (e) => {
                    this.renderUserMetrics(e.target.value, localSessions, localUsers);
                });
            }

        } catch(e) {
            console.error("Error al cargar la BD real:", e);
            uTable.innerHTML = `<tr><td colspan="4" style="color:red;">Error de Base de Datos. ${e.message}</td></tr>`;
        }
    },

    renderUserMetrics(userId, allSessions, allUsers) {
        const metricsContainer = document.getElementById('user-metrics');
        if (!userId) {
            metricsContainer.innerHTML = '<div style="text-align:center; grid-column: 1 / -1;"><p style="color:#888;">Aguardando selector para calcular estadísticas avanzadas.</p></div>';
            return;
        }

        const particularSessions = allSessions.filter(s => s.usuario_id === userId);
        const userDict = allUsers.find(u => u.id === userId);

        const totalSesiones = particularSessions.length;
        let totalSegundos = 0;
        let finalizadas = 0;

        particularSessions.forEach(s => {
            if(s.duracion) {
                totalSegundos += s.duracion;
                finalizadas++;
            }
        });

        metricsContainer.innerHTML = `
            <div style="background:#111; padding:15px; border-radius:8px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
                <p style="font-size:0.8rem; color:#888;">Asistencias a Sesión</p>
                <strong style="color:var(--color-gold); font-size:1.8rem;">${totalSesiones}</strong>
            </div>
            <div style="background:#111; padding:15px; border-radius:8px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
                <p style="font-size:0.8rem; color:#888;">Flujos Completados</p>
                <strong style="color:#2ecc71; font-size:1.8rem;">${finalizadas}</strong>
            </div>
            <div style="background:#111; padding:15px; border-radius:8px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
                <p style="font-size:0.8rem; color:#888;">Eficiencia Bio/Voz</p>
                <strong style="color:#3498db; font-size:1.8rem;">100%</strong>
            </div>
            <div style="background:var(--color-gold); padding:15px; border-radius:8px; text-align:center; box-shadow:0 4px 15px rgba(181, 148, 84, 0.3);">
                <p style="font-size:0.85rem; color:#000; font-weight:600;">Tiempo Acumulado Válido</p>
                <strong style="color:#000; font-size:1.8rem;">${this.formatDuration(totalSegundos)}</strong>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AdminDashboard.init();
});

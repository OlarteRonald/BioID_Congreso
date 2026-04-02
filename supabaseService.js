const SUPABASE_URL = "https://qkjioyidtmyhfpamrttp.supabase.co";
const SUPABASE_KEY = "sb_publishable_QgSPzchU_rScYgoST0HaqA_QltLVPJV";

export const SupabaseService = {
    client: null,
    
    init() {
        if(window.supabase && !this.client) {
            this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase Client Started");
        }
    },

    async insertUserEntry(userData) {
        this.init();
        if(!this.client) throw new Error("Client not initialized");

        const { data, error } = await this.client
            .from('usuarios')
            .insert({
                nombre: userData.nombre,
                correo: userData.correo,
                usuario: userData.usuario,
                password: userData.password,
                foto_biometrica: userData.foto_biometrica
            });

        return { data, error };
    },

    async loginCustomUser(usuario, password) {
        this.init();
        if(!this.client) throw new Error("Client not initialized");

        const { data, error } = await this.client
            .from('usuarios')
            .select('*')
            .eq('usuario', usuario)
            .eq('password', password)
            .single();
            
        return { data, error };
    },

    async startSession(userId) {
        this.init();
        const { data, error } = await this.client
            .from('sesiones')
            .insert({
                usuario_id: userId
            })
            .select('*')
            .single();
        return { data, error };
    },

    async endSession(sessionId, durationSeconds) {
        this.init();
        const { data, error } = await this.client
            .from('sesiones')
            .update({
                fecha_fin: new Date().toISOString(),
                duracion: durationSeconds
            })
            .eq('id', sessionId);
        return { data, error };
    }
};

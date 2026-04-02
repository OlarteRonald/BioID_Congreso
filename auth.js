import { SupabaseService } from './supabaseService.js';

export const AuthFlow = {
    async login(email, password) {
        try {
            return await SupabaseService.signIn(email, password);
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },
    
    async register(userData) {
        try {
            const resp = await SupabaseService.insertUserEntry(userData);
            if (resp.error) throw resp.error;
            
            // Mock de enviar correo
            console.log("Simulando envío de correo a: " + userData.correo);
            return { success: true };
        } catch (error) {
            console.error("Error en registro:", error);
            return { success: false, error: error.message };
        }
    }
};

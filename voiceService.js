export const VoiceService = {
    async listen() {
        console.log("Escuchando comando de voz...");
        return { transcript: "acceso concedido", confidence: 0.95 };
    }
};

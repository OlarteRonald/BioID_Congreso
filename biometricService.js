export const BiometricService = {
    async detectFace() {
        console.log("Simulando detección facial...");
        return { match: true, confidence: 0.98 };
    }
};

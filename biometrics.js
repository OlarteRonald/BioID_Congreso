export const BiometricsFlow = {
    async startCamera(videoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoElement.srcObject = stream;
            return stream;
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            alert("Necesita dar permisos de cámara para el registro biométrico.");
            return null;
        }
    },

    capturePhoto(videoElement, canvasElement) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        const ctx = canvasElement.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        return canvasElement.toDataURL('image/jpeg', 0.8); // Base64
    },

    stopCamera(stream) {
        if(stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
};

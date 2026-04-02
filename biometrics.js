export const BiometricsFlow = {

    async startCamera(videoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoElement.srcObject = stream;
            
            videoElement.onloadedmetadata = () => {
                videoElement.play().catch(e => console.error("Error reproduciendo el feed:", e));
            };

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
        return canvasElement.toDataURL('image/jpeg', 0.8);
    },

    /**
     * Genera una firma biométrica facial del canvas.
     * Recorta la zona central del rostro, reduce a 64x64 en escala de grises,
     * y normaliza los valores para compensar cambios de iluminación.
     * Retorna un array de 4096 valores (64x64) entre 0-255.
     */
    getFaceSignature(canvasElement) {
        const size = 64;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext('2d');

        // Recortar la parte central del frame (donde se espera el rostro)
        const srcW = canvasElement.width;
        const srcH = canvasElement.height;
        const cropW = srcW * 0.5;  // 50% ancho central
        const cropH = srcH * 0.7;  // 70% alto central
        const sx = (srcW - cropW) / 2;
        const sy = (srcH - cropH) * 0.3; // Un poco más arriba para captar la cara

        ctx.drawImage(canvasElement, sx, sy, cropW, cropH, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;
        const grayscale = [];

        for (let i = 0; i < pixels.length; i += 4) {
            grayscale.push(
                Math.round(pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114)
            );
        }

        // Normalizar para compensar diferencias de brillo/contraste
        let min = 255, max = 0;
        for (const v of grayscale) {
            if (v < min) min = v;
            if (v > max) max = v;
        }
        const range = max - min || 1;
        return grayscale.map(v => Math.round((v - min) / range * 255));
    },

    /**
     * Compara dos firmas faciales usando el Coeficiente de Correlación de Pearson.
     * Este método es robusto ante cambios de iluminación y contraste.
     * Retorna: { match: bool, confidence: string (%), distance: number }
     */
    compareFaces(sig1, sig2, threshold = 0.52) {
        const n = sig1.length;
        let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

        for (let i = 0; i < n; i++) {
            sum1 += sig1[i];
            sum2 += sig2[i];
            sum1Sq += sig1[i] * sig1[i];
            sum2Sq += sig2[i] * sig2[i];
            pSum += sig1[i] * sig2[i];
        }

        const num = pSum - (sum1 * sum2 / n);
        const den = Math.sqrt(
            (sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n)
        );

        const correlation = den === 0 ? 0 : num / den;

        return {
            match: correlation > threshold,
            distance: 1 - correlation,
            confidence: Math.max(0, correlation * 100).toFixed(1)
        };
    },

    stopCamera(stream) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
};

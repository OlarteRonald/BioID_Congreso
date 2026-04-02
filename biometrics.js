const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

export const BiometricsFlow = {
    modelsLoaded: false,

    async loadModels() {
        if (this.modelsLoaded) return;
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            this.modelsLoaded = true;
            console.log("Face-API models loaded successfully");
        } catch (err) {
            console.error("Error loading face-api models:", err);
            throw err;
        }
    },

    async startCamera(videoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoElement.srcObject = stream;
            
            videoElement.onloadedmetadata = () => {
                videoElement.play().catch(e => console.error("Error reproduciendo el feed de la cámara:", e));
            };
            
            // Cargar modelos de reconocimiento facial en paralelo
            this.loadModels().catch(e => console.warn("Modelos faciales cargando en segundo plano...", e));

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

    async getFaceDescriptor(canvasElement) {
        if (!this.modelsLoaded) {
            await this.loadModels();
        }

        const detection = await faceapi
            .detectSingleFace(canvasElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) return null;
        return Array.from(detection.descriptor); // Float32Array → Array normal para JSON
    },

    compareFaces(descriptor1, descriptor2, threshold = 0.55) {
        // Distancia euclidiana entre los dos vectores de 128 dimensiones
        const distance = faceapi.euclideanDistance(
            new Float32Array(descriptor1),
            new Float32Array(descriptor2)
        );
        return {
            match: distance < threshold,
            distance: distance,
            confidence: Math.max(0, (1 - distance) * 100).toFixed(1)
        };
    },

    stopCamera(stream) {
        if(stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
};

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

export const BiometricsFlow = {
    modelsLoaded: false,
    modelsLoading: null,

    async loadModels() {
        if (this.modelsLoaded) return true;
        if (this.modelsLoading) return this.modelsLoading;

        this.modelsLoading = (async () => {
            try {
                console.log("Descargando modelos de reconocimiento facial...");
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                console.log("Modelo 1/3 cargado: Detector facial");
                await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
                console.log("Modelo 2/3 cargado: Landmarks faciales");
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                console.log("Modelo 3/3 cargado: Red de reconocimiento");
                this.modelsLoaded = true;
                return true;
            } catch (err) {
                console.error("Error cargando modelos face-api:", err);
                this.modelsLoading = null;
                throw err;
            }
        })();

        return this.modelsLoading;
    },

    async startCamera(videoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoElement.srcObject = stream;
            
            videoElement.onloadedmetadata = () => {
                videoElement.play().catch(e => console.error("Error reproduciendo el feed de la cámara:", e));
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

    async getFaceDescriptor(canvasElement) {
        // Cargar modelos con timeout de 30s
        const modelPromise = this.loadModels();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Tiempo agotado descargando modelos de IA. Verifique su conexión a internet.")), 30000)
        );

        await Promise.race([modelPromise, timeoutPromise]);

        if (!this.modelsLoaded) {
            throw new Error("Los modelos de IA no se pudieron cargar.");
        }

        const detection = await faceapi
            .detectSingleFace(canvasElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
            .withFaceLandmarks(true) // true = usar modelo tiny
            .withFaceDescriptor();

        if (!detection) return null;
        return Array.from(detection.descriptor);
    },

    compareFaces(descriptor1, descriptor2, threshold = 0.55) {
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

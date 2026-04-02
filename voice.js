export const VoiceFlow = {
    recognizer: null,
    onListenCallback: null,
    
    async initModel(modelUrl) {
        if (this.recognizer) return this.recognizer;

        const checkpointURL = modelUrl + "model.json";
        const metadataURL = modelUrl + "metadata.json";

        const recognizer = window.speechCommands.create(
            "BROWSER_FFT",
            undefined,
            checkpointURL,
            metadataURL
        );

        await recognizer.ensureModelLoaded();
        this.recognizer = recognizer;
        return recognizer;
    },

    setOnListen(callback) {
        this.onListenCallback = callback;
    },

    async listenFor(targetClass, onMatch) {
        if (!this.recognizer) return;
        
        const classLabels = this.recognizer.wordLabels();
        
        this.recognizer.listen(result => {
            const scores = result.scores;
            const targetIndex = classLabels.indexOf(targetClass);
            
            if (this.onListenCallback) {
                // Sacar el ruido global más alto para mover la barra, o la palabra clave per se
                let maxScore = Math.max(...scores);
                this.onListenCallback(maxScore);
            }

            if(targetIndex !== -1 && scores[targetIndex] > 0.80) { // umbral validacion
                this.recognizer.stopListening();
                onMatch();
            }
        }, {
            includeSpectrogram: false,
            probabilityThreshold: 0.10, // bajo para capturar callbacks en tiempo real de ruido
            invokeCallbackOnNoiseAndUnknown: true, // necesario para barra en tiempo real
            overlapFactor: 0.50
        });
    },

    stopListening() {
        if(this.recognizer && this.recognizer.isListening()) {
            this.recognizer.stopListening();
        }
    }
};

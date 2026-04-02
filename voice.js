export const VoiceFlow = {
    recognizer: null,
    
    async initModel(modelUrl) {
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

    async listenFor(targetClass, onMatch) {
        if (!this.recognizer) return;
        
        const classLabels = this.recognizer.wordLabels();
        
        this.recognizer.listen(result => {
            const scores = result.scores;
            const targetIndex = classLabels.indexOf(targetClass);
            if(targetIndex !== -1 && scores[targetIndex] > 0.85) {
                this.recognizer.stopListening();
                onMatch();
            }
        }, {
            includeSpectrogram: false,
            probabilityThreshold: 0.85,
            invokeCallbackOnNoiseAndUnknown: false,
            overlapFactor: 0.50
        });
    },

    stopListening() {
        if(this.recognizer && this.recognizer.isListening()) {
            this.recognizer.stopListening();
        }
    }
};

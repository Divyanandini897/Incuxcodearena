export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private isSpeaking = false;
  private intentionalStop = false;
  private restartCount = 0;
  private maxRestarts = 50;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
    }
  }

  private get SpeechRecognitionAPI(): typeof SpeechRecognition | null {
    return (
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    ) as typeof SpeechRecognition | null;
  }

  get isSupported(): boolean {
    return !!(this.SpeechRecognitionAPI && this.synthesis);
  }

  get isActive(): boolean {
    return this.isListening;
  }

  get isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  onTranscript(callback: (text: string, isFinal: boolean) => void) {
    this.onTranscriptCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }

  startListening() {
    const API = this.SpeechRecognitionAPI;
    if (!API) {
      this.onErrorCallback?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) return;

    this.intentionalStop = false;

    try {
      this.recognition = new API();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        this.restartCount = 0;
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (final) this.onTranscriptCallback?.(final, true);
        if (interim) this.onTranscriptCallback?.(interim, false);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        this.isListening = false;
        const messages: Record<string, string> = {
          'not-allowed': 'Microphone permission denied. Please allow microphone access in your browser settings.',
          'audio-capture': 'No microphone found. Please connect a microphone and try again.',
          'network': 'Network error occurred during speech recognition. Please check your connection.',
          'service-not-allowed': 'Speech recognition service is not allowed. Please check your browser settings.',
        };
        this.onErrorCallback?.(messages[event.error] || `Recognition error: ${event.error}`);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onEndCallback?.();

        if (!this.intentionalStop && this.restartCount < this.maxRestarts) {
          this.restartCount++;
          if (this.restartTimer) clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
            if (!this.intentionalStop) this.startListening();
          }, 300);
        }
      };

      this.recognition.start();
      this.isListening = true;
      this.restartCount = 0;
    } catch (err) {
      this.isListening = false;
      this.recognition = null;
      this.onErrorCallback?.('Failed to start speech recognition. Please use Chrome, Edge, or Safari.');
    }
  }

  stopListening() {
    this.intentionalStop = true;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition && this.isListening) {
      try { this.recognition.stop(); } catch { /* ignore */ }
    }
    this.isListening = false;
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }

      this.synthesis.cancel();
      this.isSpeaking = true;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google'))
        || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => { this.isSpeaking = false; resolve(); };
      utterance.onerror = () => { this.isSpeaking = false; resolve(); };

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) this.synthesis.cancel();
    this.isSpeaking = false;
  }

  destroy() {
    this.intentionalStop = true;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    this.stopListening();
    this.stopSpeaking();
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.recognition = null;
  }
}

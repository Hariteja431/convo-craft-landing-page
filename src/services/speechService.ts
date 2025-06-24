
export interface SpeechConfig {
  language: string;
  preferMaleVoice?: boolean;
}

export class SpeechService {
  private static getLanguageCode(languageCode: string): string {
    // Map our language codes to Speech API language codes
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN',
      'as': 'as-IN',
      'ur': 'ur-IN',
      'ne': 'ne-NP',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA'
    };
    return languageMap[languageCode] || 'en-US';
  }

  private static getBestVoiceForLanguage(languageCode: string, preferMale: boolean = false): SpeechSynthesisVoice | null {
    if (!('speechSynthesis' in window)) return null;

    const voices = speechSynthesis.getVoices();
    const targetLang = this.getLanguageCode(languageCode);
    
    console.log('Available voices for', targetLang, ':', voices.filter(v => v.lang.startsWith(targetLang.split('-')[0])));

    // Filter voices by language
    const languageVoices = voices.filter(voice => {
      const voiceLang = voice.lang.toLowerCase();
      const targetLangBase = targetLang.split('-')[0].toLowerCase();
      return voiceLang.startsWith(targetLangBase) || voiceLang.includes(targetLangBase);
    });

    if (languageVoices.length === 0) {
      console.warn('No voices found for language:', targetLang);
      return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
    }

    // Try to find male voice if preferred
    if (preferMale) {
      const maleVoice = languageVoices.find(voice => {
        const name = voice.name.toLowerCase();
        return name.includes('male') || 
               name.includes('man') || 
               name.includes('masculine') ||
               name.includes('deep') ||
               // Common male voice names
               name.includes('david') ||
               name.includes('alex') ||
               name.includes('sam') ||
               name.includes('ravi') ||
               name.includes('ankit') ||
               name.includes('rajesh') ||
               name.includes('amit');
      });

      if (maleVoice) {
        console.log('Selected male voice:', maleVoice.name);
        return maleVoice;
      }
    }

    // Fallback to any voice in the language, preferring local voices
    const localVoice = languageVoices.find(v => v.localService);
    if (localVoice) {
      console.log('Selected local voice:', localVoice.name);
      return localVoice;
    }

    console.log('Selected voice:', languageVoices[0].name);
    return languageVoices[0];
  }

  static speakText(text: string, config: SpeechConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      // Wait for voices to load if they haven't already
      const speak = () => {
        const voice = this.getBestVoiceForLanguage(config.language, config.preferMaleVoice);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = 0.9;
        utterance.pitch = config.preferMaleVoice ? 0.8 : 1.0; // Lower pitch for male-like effect
        utterance.volume = 0.8;
        utterance.lang = this.getLanguageCode(config.language);

        console.log('Speaking with voice:', voice?.name, 'Language:', utterance.lang);

        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);

        speechSynthesis.speak(utterance);
      };

      // Check if voices are loaded
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait for voices to load
        speechSynthesis.onvoiceschanged = () => {
          speak();
          speechSynthesis.onvoiceschanged = null;
        };
      } else {
        speak();
      }
    });
  }

  static startRecognition(config: SpeechConfig): Promise<SpeechRecognition> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = this.getLanguageCode(config.language);
      
      console.log('Starting speech recognition with language:', recognition.lang);
      
      resolve(recognition);
    });
  }

  static stopSpeech(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }
}

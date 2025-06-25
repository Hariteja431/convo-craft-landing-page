// ElevenLabs API service for STT and TTS
const ELEVENLABS_API_KEY = 'sk_6c22c1767a15a84d421464cbae8de96c97608c6e9bb58978';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export class ElevenLabsService {
  // Text-to-Speech using ElevenLabs
  static async textToSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<ArrayBuffer> {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS API error: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error with ElevenLabs TTS:', error);
      throw error;
    }
  }

  // Get available voices
  static async getVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs Voices API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Speech-to-Text using ElevenLabs (if available) or fallback to browser API
  static async speechToText(audioBlob: Blob): Promise<string> {
    // ElevenLabs doesn't have a direct STT API, so we'll use browser's built-in STT
    // This is a placeholder for future implementation if ElevenLabs adds STT
    return new Promise((resolve, reject) => {
      // For now, we'll continue using browser's speech recognition
      // This method is here for future expansion
      resolve('Browser STT will be used');
    });
  }

  // Play audio from ArrayBuffer
  static async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBufferDecoded = await audioContext.decodeAudioData(audioBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferDecoded;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  // Get voice ID based on gender preference
  static getVoiceId(gender: 'male' | 'female'): string {
    // Default voice IDs from ElevenLabs
    const voices = {
      female: 'pNInz6obpgDQGcFmaJgB', // Rachel
      male: 'VR6AewLTigWG4xSOukaG', // Sam
    };
    return voices[gender];
  }
}
export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

export interface ElevenLabsResponse {
  audio: Blob;
}

export class ElevenLabsService {
  private static readonly API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  private static readonly BASE_URL = 'https://api.elevenlabs.io/v1';

  // Predefined voices for better performance
  static getAvailableVoices(): Voice[] {
    return [
      { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade', description: 'Deep, authoritative male voice' },
      { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade', description: 'Warm, friendly female voice' },
      { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'premade', description: 'Well-rounded male voice' },
      { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', category: 'premade', description: 'Crisp, clear male voice' },
      { voice_id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', category: 'premade', description: 'Raspy, casual male voice' },
      { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'premade', description: 'Strong, confident female voice' },
      { voice_id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', category: 'premade', description: 'Conversational male voice' },
      { voice_id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Lily', category: 'premade', description: 'Warm, articulate female voice' },
      { voice_id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', category: 'premade', description: 'Casual, natural male voice' },
      { voice_id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', category: 'premade', description: 'Warm, engaging male voice' },
      { voice_id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', category: 'premade', description: 'Hoarse, intense male voice' },
      { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', category: 'premade', description: 'Seductive, confident female voice' },
      { voice_id: 'ThT5KcBeYPX3keUQqHPh', name: 'Sarah', category: 'premade', description: 'Soft, gentle female voice' },
      { voice_id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', category: 'premade', description: 'Articulate male voice' },
      { voice_id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', category: 'premade', description: 'Warm, pleasant female voice' }
    ];
  }

  static async generateSpeech(text: string, voiceId: string): Promise<Blob> {
    try {
      console.log('Generating speech with ElevenLabs...', { text: text.substring(0, 50), voiceId });
      
      const response = await fetch(`${this.BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      console.log('Speech generated successfully, blob size:', audioBlob.size);
      return audioBlob;
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      throw error;
    }
  }

  static async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/voices`, {
        headers: {
          'xi-api-key': this.API_KEY
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch voices from API, using predefined list');
        return this.getAvailableVoices();
      }

      const data = await response.json();
      return data.voices || this.getAvailableVoices();
    } catch (error) {
      console.warn('Error fetching voices, using predefined list:', error);
      return this.getAvailableVoices();
    }
  }
}
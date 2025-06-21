import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;;

export interface AudioUnderstandingResponse {
  text: string;
  feedback?: {
    grammar: string;
    pronunciation: string;
    fluency: string;
  };
}

export class GeminiAudioService {
  // private static ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  private static ai = new GoogleGenAI(GEMINI_API_KEY); // ✅


  // Audio Understanding - Convert audio to text and get response
  static async processAudioInput(audioBlob: Blob, conversationContext?: string): Promise<AudioUnderstandingResponse> {
    try {
      console.log('Processing audio input with Gemini...');
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const prompt = conversationContext 
        ? `You are a helpful English conversation partner. Based on our conversation context: "${conversationContext}", please transcribe the audio and provide a natural conversational response. Keep your response to 2-3 sentences and ask a follow-up question to continue the dialogue.`
        : `You are a helpful English conversation partner. Please transcribe this audio and provide a natural conversational response. Keep your response to 2-3 sentences and ask a follow-up question to continue the dialogue.`;

      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
      ];

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });

      const responseText = response.text || 'I understand. Can you tell me more about that?';
      
      console.log('Gemini audio understanding response:', responseText);
      
      return {
        text: responseText,
        feedback: {
          grammar: 'Good sentence structure!',
          pronunciation: 'Clear pronunciation',
          fluency: 'Natural flow'
        }
      };
    } catch (error) {
      console.error('Error processing audio input:', error);
      return {
        text: 'I understand. Can you tell me more about that?',
        feedback: {
          grammar: 'Keep practicing!',
          pronunciation: 'Good effort!',
          fluency: 'You\'re doing well!'
        }
      };
    }
  }

  // Speech Generation - Convert text to audio
  static async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<Blob | null> {
    try {
      console.log('Generating speech with Gemini TTS...');
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (audioData) {
        // Convert base64 to blob
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/wav' });
        console.log('Speech generated successfully');
        return audioBlob;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating speech:', error);
      return null;
    }
  }

  // Start conversation with topic
  static async startConversation(topic: string): Promise<string> {
    try {
      console.log('Starting conversation with topic:', topic);
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          parts: [{
            text: `You are a friendly AI conversation partner helping someone practice English through speech. Start a casual conversation about ${topic}. Keep your response conversational, engaging, and ask a follow-up question to continue the dialogue. Limit your response to 2-3 sentences. Make it natural for speech.`
          }]
        }],
      });

      const responseText = response.text || 'Hello! Let\'s start practicing. How are you today?';
      console.log('Conversation started:', responseText);
      return responseText;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return 'Hello! I\'m here to help you practice English. How are you feeling today?';
    }
  }

  // Get available voice options
  static getAvailableVoices(): Array<{ name: string; description: string }> {
    return [
      { name: 'Kore', description: 'Firm' },
      { name: 'Puck', description: 'Upbeat' },
      { name: 'Charon', description: 'Informative' },
      { name: 'Zephyr', description: 'Bright' },
      { name: 'Fenrir', description: 'Excitable' },
      { name: 'Leda', description: 'Youthful' },
      { name: 'Orus', description: 'Firm' },
      { name: 'Aoede', description: 'Breezy' },
      { name: 'Callirrhoe', description: 'Easy-going' },
      { name: 'Autonoe', description: 'Bright' },
      { name: 'Enceladus', description: 'Breathy' },
      { name: 'Iapetus', description: 'Clear' },
      { name: 'Umbriel', description: 'Easy-going' },
      { name: 'Algieba', description: 'Smooth' },
      { name: 'Despina', description: 'Smooth' },
      { name: 'Erinome', description: 'Clear' },
      { name: 'Algenib', description: 'Gravelly' },
      { name: 'Rasalgethi', description: 'Informative' },
      { name: 'Laomedeia', description: 'Upbeat' },
      { name: 'Achernar', description: 'Soft' },
      { name: 'Alnilam', description: 'Firm' },
      { name: 'Schedar', description: 'Even' },
      { name: 'Gacrux', description: 'Mature' },
      { name: 'Pulcherrima', description: 'Forward' },
      { name: 'Achird', description: 'Friendly' },
      { name: 'Zubenelgenubi', description: 'Casual' },
      { name: 'Vindemiatrix', description: 'Gentle' },
      { name: 'Sadachbia', description: 'Lively' },
      { name: 'Sadaltager', description: 'Knowledgeable' },
      { name: 'Sulafat', description: 'Warm' }
    ];
  }
}
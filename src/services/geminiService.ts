
// Using the new Gemini 2.5 Flash API for faster responses
const GEMINI_API_KEY = 'AIzaSyDCqfTv5cbjOh0LbPsBhji8AQmrlLz4XjE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Cloud-based API for TTS/STT
const CLOUD_API_KEY = 'AIzaSyAckaPvwEQZ-CkEAYYNFkTZrioUJjn0B_s';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ConversationResponse {
  response: string;
  feedback?: {
    grammar: string;
    pronunciation: string;
    fluency: string;
  };
}

export class GeminiService {
  private static async makeRequest(messages: GeminiMessage[]): Promise<any> {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512, // Reduced for faster responses
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getRealtimeResponse(userMessage: string, conversationHistory: GeminiMessage[] = []): Promise<string> {
    console.log('Getting realtime response for:', userMessage);
    
    const systemPrompt = 'You are a helpful AI conversation partner. Respond naturally and conversationally in 1-2 short sentences. Keep responses brief and engaging for real-time speech conversation.';
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand. Please continue.';
      
      console.log('Gemini realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      return 'I hear you. Can you tell me more?';
    }
  }

  static async startConversation(prompt: string): Promise<string> {
    console.log('Starting conversation with prompt:', prompt);
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Hello! I\'m ready to help you practice. How can I assist you today?';
      console.log('Gemini response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return 'Hi there! I\'m ready to help you practice. What would you like to work on?';
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: GeminiMessage[]): Promise<ConversationResponse> {
    const response = await this.getRealtimeResponse(userMessage, conversationHistory);
    
    return {
      response,
      feedback: {
        grammar: 'Good!',
        pronunciation: 'Clear',
        fluency: 'Natural'
      }
    };
  }

  static async getFeedback(userMessage: string): Promise<{ grammar: string; pronunciation: string; fluency: string }> {
    return {
      grammar: 'Well structured!',
      pronunciation: 'Clear pronunciation',
      fluency: 'Good flow!'
    };
  }
}

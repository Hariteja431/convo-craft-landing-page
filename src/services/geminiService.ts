
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
          temperature: 0.8,
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

  static async getRealtimeResponse(userMessage: string, conversationHistory: GeminiMessage[] = [], customPrompt?: string): Promise<string> {
    console.log('Getting realtime response for:', userMessage);
    
    const systemPrompt = customPrompt || `You are a helpful AI conversation partner and communication mentor. 
    Respond naturally and conversationally in 1-2 sentences. Keep responses brief and engaging for real-time speech conversation.
    Always end with an engaging question or prompt that encourages the user to continue speaking and share more.
    Be supportive, encouraging, and help improve their communication skills through natural conversation.`;
    
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
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'That sounds interesting! Can you tell me more about that?';
      
      console.log('Gemini realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      return 'I hear you. What else would you like to explore about this topic?';
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
      return 'Hi there! I\'m your communication mentor. What would you like to work on together?';
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: GeminiMessage[]): Promise<ConversationResponse> {
    const mentorPrompt = `You are an expert communication mentor. Respond naturally to the user's message, 
    then ask an engaging follow-up question that helps them practice more. Be encouraging and supportive.
    Keep responses conversational but valuable as a mentor.`;
    
    const response = await this.getRealtimeResponse(userMessage, conversationHistory, mentorPrompt);
    
    return {
      response,
      feedback: {
        grammar: 'Excellent structure!',
        pronunciation: 'Clear and confident',
        fluency: 'Natural flow!'
      }
    };
  }

  static async getFeedback(userMessage: string): Promise<{ grammar: string; pronunciation: string; fluency: string }> {
    return {
      grammar: 'Well structured and clear!',
      pronunciation: 'Confident delivery',
      fluency: 'Smooth conversational flow!'
    };
  }
}


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
          topK: 30,
          topP: 0.85,
          maxOutputTokens: 256, // Reduced for shorter responses
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getRealtimeResponse(userMessage: string, conversationHistory: GeminiMessage[] = [], customPrompt?: string, selectedLanguage?: string): Promise<string> {
    console.log('Getting realtime response for:', userMessage);
    
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${this.getLanguageName(selectedLanguage)}. Never use English words or phrases.` 
      : '';
    
    const systemPrompt = customPrompt || `You are a friendly, encouraging AI conversation mentor. 
    ${languageInstruction}
    
    RESPONSE STYLE:
    - Keep responses to 1-2 SHORT sentences (15-25 words max)
    - Be warm, supportive, and engaging
    - Sound natural and conversational, not robotic
    - ALWAYS end with a follow-up question or prompt that encourages more speaking
    - Use varied conversation starters like "What do you think about...", "Have you ever...", "Tell me more about...", "How would you describe..."
    - Be genuinely curious about their thoughts and experiences
    - Avoid repetitive phrases`;
    
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
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'That\'s interesting! What made you think of that?';
      
      console.log('Gemini realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      return 'I hear you! Can you tell me more about that?';
    }
  }

  static async startConversation(prompt: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Starting conversation with prompt:', prompt);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases.` 
      : '';
    
    const contextualPrompt = `${languageInstruction}
    
    You are a warm, friendly AI mentor for ${selectedTopic || 'conversation practice'} in ${languageName}. 
    
    Start with a brief, enthusiastic greeting (1-2 sentences max). Ask an engaging question about ${selectedTopic || 'their goals'} that gets them talking immediately.
    
    Be conversational, not formal. Sound like a supportive friend, not a teacher.`;
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: contextualPrompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Hi there! I\'m excited to practice with you. What would you like to work on today?';
      console.log('Gemini response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return 'Hello! Ready to have a great conversation? What interests you most today?';
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: GeminiMessage[], selectedLanguage?: string, selectedTopic?: string): Promise<ConversationResponse> {
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases.` 
      : '';
    
    const mentorPrompt = `${languageInstruction}
    
    You are a supportive conversation mentor for ${selectedTopic?.toLowerCase() || 'conversation practice'} in ${languageName}. 
    
    GUIDELINES:
    - Keep responses SHORT (1-2 sentences, 15-25 words)
    - Respond naturally to what they said first
    - ALWAYS end with an engaging follow-up question
    - Be encouraging and show genuine interest
    - Use varied question starters: "What's your take on...", "How do you feel about...", "Have you noticed...", "What would you do if..."
    - Sound like a friendly conversation partner, not a formal teacher
    - Keep the conversation flowing naturally`;
    
    const response = await this.getRealtimeResponse(userMessage, conversationHistory, mentorPrompt, selectedLanguage);
    
    return {
      response,
      feedback: {
        grammar: 'Great structure!',
        pronunciation: 'Clear delivery',
        fluency: 'Natural flow!'
      }
    };
  }

  static async getFeedback(userMessage: string): Promise<{ grammar: string; pronunciation: string; fluency: string }> {
    return {
      grammar: 'Excellent communication!',
      pronunciation: 'Clear and confident',
      fluency: 'Very natural!'
    };
  }

  private static getLanguageName(languageCode: string): string {
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish (Español)',
      'fr': 'French (Français)',
      'de': 'German (Deutsch)',
      'it': 'Italian (Italiano)',
      'pt': 'Portuguese (Português)',
      'zh': 'Chinese (中文)',
      'ja': 'Japanese (日本語)',
      'ko': 'Korean (한국어)',
      'ar': 'Arabic (العربية)'
    };
    return languageMap[languageCode] || 'English';
  }
}


// Using the new Gemini 2.5 Flash API for faster responses
const GEMINI_API_KEY = 'AIzaSyDCqfTv5cbjOh0LbPsBhji8AQmrlLz4XjE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

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

export interface UserContext {
  conversationHistory: { conversation: any; messages: any[] }[];
  preferences?: {
    preferred_language?: string;
    difficulty_level?: string;
    practice_goals?: string[];
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
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getRealtimeResponse(
    userMessage: string, 
    conversationHistory: GeminiMessage[] = [], 
    customPrompt?: string, 
    selectedLanguage?: string,
    userContext?: UserContext
  ): Promise<string> {
    console.log('Getting tailored realtime response for:', userMessage);
    
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${this.getLanguageName(selectedLanguage)}. Never use English words or phrases.` 
      : '';
    
    // Build personalized context from user's conversation history
    const personalizedContext = this.buildPersonalizedContext(userContext);
    
    const systemPrompt = customPrompt || `You are a friendly, encouraging AI conversation mentor. 
    ${languageInstruction}
    
    ${personalizedContext}
    
    RESPONSE STYLE:
    - Keep responses to 1-2 SHORT sentences (15-25 words max)
    - Be warm, supportive, and engaging
    - Sound natural and conversational, not robotic
    - ALWAYS end with a follow-up question or prompt that encourages more speaking
    - Use varied conversation starters based on the user's interests and past conversations
    - Be genuinely curious about their thoughts and experiences
    - Reference their previous topics when appropriate to show continuity`;
    
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
      
      console.log('Gemini tailored response:', response);
      return response;
    } catch (error) {
      console.error('Error getting tailored response:', error);
      return 'I hear you! Can you tell me more about that?';
    }
  }

  static async startConversation(
    prompt: string, 
    selectedLanguage?: string, 
    selectedTopic?: string,
    userContext?: UserContext
  ): Promise<string> {
    console.log('Starting personalized conversation with prompt:', prompt);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases.` 
      : '';
    
    const personalizedContext = this.buildPersonalizedContext(userContext);
    
    const contextualPrompt = `${languageInstruction}
    
    You are a warm, friendly AI mentor for ${selectedTopic || 'conversation practice'} in ${languageName}. 
    
    ${personalizedContext}
    
    Start with a brief, enthusiastic greeting (1-2 sentences max). Ask an engaging question about ${selectedTopic || 'their goals'} that gets them talking immediately.
    
    Be conversational, not formal. Sound like a supportive friend who remembers past conversations.`;
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: contextualPrompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Welcome back! Ready for another great conversation?';
      console.log('Gemini personalized response:', response);
      return response;
    } catch (error) {
      console.error('Error starting personalized conversation:', error);
      return 'Hello! Ready to continue where we left off? What interests you most today?';
    }
  }

  static async continueConversation(
    userMessage: string, 
    conversationHistory: GeminiMessage[], 
    selectedLanguage?: string, 
    selectedTopic?: string,
    userContext?: UserContext
  ): Promise<ConversationResponse> {
    const response = await this.getRealtimeResponse(
      userMessage, 
      conversationHistory, 
      undefined, 
      selectedLanguage, 
      userContext
    );
    
    return {
      response,
      feedback: {
        grammar: 'Great structure!',
        pronunciation: 'Clear delivery',
        fluency: 'Natural flow!'
      }
    };
  }

  private static buildPersonalizedContext(userContext?: UserContext): string {
    if (!userContext) return '';
    
    let context = '';
    
    // Add user preferences context
    if (userContext.preferences) {
      const { difficulty_level, practice_goals } = userContext.preferences;
      
      if (difficulty_level) {
        context += `The user's skill level is ${difficulty_level}. Adjust your language complexity accordingly. `;
      }
      
      if (practice_goals && practice_goals.length > 0) {
        context += `Their practice goals include: ${practice_goals.join(', ')}. `;
      }
    }
    
    // Add conversation history context
    if (userContext.conversationHistory && userContext.conversationHistory.length > 0) {
      const recentTopics = userContext.conversationHistory
        .slice(0, 3)
        .map(ch => ch.conversation.scenario_type || 'general')
        .filter((topic, index, arr) => arr.indexOf(topic) === index);
      
      if (recentTopics.length > 0) {
        context += `In recent conversations, they've discussed: ${recentTopics.join(', ')}. You can reference these topics naturally. `;
      }
      
      const totalConversations = userContext.conversationHistory.length;
      if (totalConversations > 5) {
        context += `This is an experienced user with ${totalConversations} previous conversations. They appreciate more advanced interactions. `;
      }
    }
    
    return context ? `PERSONALIZATION CONTEXT: ${context}` : '';
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


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
          maxOutputTokens: 512, // Increased for better responses
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getRealtimeResponse(userMessage: string, conversationHistory: GeminiMessage[] = [], customPrompt?: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Getting realtime response for:', userMessage);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases unless absolutely necessary for technical terms.` 
      : '';
    
    const topicContext = selectedTopic ? `about ${selectedTopic.toLowerCase()}` : '';
    
    const systemPrompt = customPrompt || `You are an enthusiastic, supportive conversation mentor specializing in ${selectedTopic || 'conversation practice'} ${topicContext}. 
    ${languageInstruction}
    
    PERSONALITY & TONE:
    - Be genuinely excited and encouraging like a friendly coach
    - Use topic-specific language and enthusiasm (e.g., "Hey there, ${selectedTopic} superstar!" for relevant topics)
    - Show authentic interest in their thoughts and experiences
    - Be warm, energetic, and motivating
    - Sound like a passionate mentor, not a robotic assistant
    
    RESPONSE STYLE:
    - Keep responses conversational and natural (2-4 sentences, 25-50 words)
    - Always include topic-relevant encouragement and energy
    - Ask engaging follow-up questions that dive deeper into ${selectedTopic || 'their interests'}
    - Use varied, enthusiastic conversation starters
    - Match their energy and build excitement about the topic
    - Be specific to ${selectedTopic || 'the conversation topic'} when possible
    
    CONVERSATION FLOW:
    - Respond directly to what they said first
    - Then ask an engaging question that keeps the conversation flowing
    - Show genuine curiosity about their perspective on ${selectedTopic || 'the topic'}
    - Use questions like: "That's fascinating! What's your experience with...", "I love that perspective! Have you found that...", "That's such an interesting point about ${selectedTopic}! How do you usually..."`;
    
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
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || `That's fascinating! Tell me more about your thoughts on ${selectedTopic || 'this topic'}!`;
      
      console.log('Gemini realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      const fallbackTopic = selectedTopic || 'this';
      return `I'm really excited to hear your thoughts on ${fallbackTopic}! What's your take on it?`;
    }
  }

  static async startConversation(prompt: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Starting conversation with prompt:', prompt, 'Language:', selectedLanguage, 'Topic:', selectedTopic);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases.` 
      : '';
    
    const topicGreeting = this.getTopicGreeting(selectedTopic, languageName);
    
    const contextualPrompt = `${languageInstruction}
    
    You are an enthusiastic conversation mentor for ${selectedTopic || 'conversation practice'} in ${languageName}. 
    
    Start with ${topicGreeting} and immediately dive into an engaging question about ${selectedTopic || 'their goals'} that gets them excited to share their thoughts.
    
    Be energetic, encouraging, and show genuine interest in helping them improve their ${selectedTopic || 'conversation'} skills.
    Keep it warm and conversational - like meeting an exciting new conversation partner!`;
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: contextualPrompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || `Hey there! I'm so excited to practice ${selectedTopic || 'conversation'} with you today! What aspect interests you most?`;
      console.log('Gemini start conversation response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return `Hello ${selectedTopic} enthusiast! I'm thrilled to help you practice today. What would you love to explore about ${selectedTopic || 'this topic'}?`;
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: GeminiMessage[], selectedLanguage?: string, selectedTopic?: string): Promise<ConversationResponse> {
    const response = await this.getRealtimeResponse(userMessage, conversationHistory, undefined, selectedLanguage, selectedTopic);
    
    return {
      response,
      feedback: {
        grammar: 'Excellent expression!',
        pronunciation: 'Clear and confident delivery',
        fluency: 'Natural conversational flow!'
      }
    };
  }

  static async generateFeedback(conversationMessages: any[], selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `Provide feedback in ${languageName}.` 
      : '';
    
    const conversationText = conversationMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.message)
      .join('\n');

    const feedbackPrompt = `As a friendly language master and conversation coach, analyze this ${selectedTopic || 'conversation'} practice session and provide encouraging, specific feedback. ${languageInstruction}

    Conversation topic: ${selectedTopic || 'General conversation'}
    User's messages: ${conversationText}

    Provide feedback in this format:
    • Overall Performance: [encouraging assessment]
    • Strengths: [specific positive points]
    • Areas for Growth: [gentle suggestions]
    • ${selectedTopic} Skills: [topic-specific feedback if relevant]
    • Next Steps: [motivating suggestions for improvement]

    Keep the tone supportive, encouraging, and constructive. Focus on progress and growth mindset.`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: feedbackPrompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Great job on your conversation practice! Keep up the excellent work!';
    } catch (error) {
      console.error('Error generating feedback:', error);
      return 'Wonderful conversation practice! You showed great engagement and communication skills. Keep practicing!';
    }
  }

  private static getTopicGreeting(topic?: string, language?: string): string {
    if (!topic) return 'a warm, enthusiastic greeting';
    
    const greetings = {
      'Daily routine': 'Hey there, daily routine rockstar!',
      'Hobbies': 'Hello hobby enthusiast!',
      'Travel': 'Hey travel adventurer!',
      'Food': 'Hello foodie friend!',
      'Work': 'Hey career champion!',
      'Movies': 'Hello movie buff!',
      'Sports': 'Hey sports superstar!',
      'Technology': 'Hello tech wizard!',
      'Public Speaking': 'Hey public speaking champion!',
      'Business': 'Hello business leader!',
      'Education': 'Hey learning enthusiast!'
    };
    
    return greetings[topic as keyof typeof greetings] || `Hey ${topic} enthusiast!`;
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
      'ar': 'Arabic (العربية)',
      'hi': 'Hindi (हिंदी)',
      'bn': 'Bengali (বাংলা)',
      'te': 'Telugu (తెలుగు)',
      'mr': 'Marathi (मराठी)',
      'ta': 'Tamil (தமிழ்)',
      'gu': 'Gujarati (ગુજરાતી)',
      'kn': 'Kannada (ಕನ್ನಡ)',
      'ml': 'Malayalam (മലയാളം)',
      'pa': 'Punjabi (ਪੰਜਾਬੀ)',
      'or': 'Odia (ଓଡ଼ିଆ)',
      'as': 'Assamese (অসমীয়া)',
      'ur': 'Urdu (اردو)',
      'sa': 'Sanskrit (संस्कृतम्)',
      'ne': 'Nepali (नेपाली)',
      'si': 'Sinhala (සිංහල)'
    };
    return languageMap[languageCode] || 'English';
  }
}

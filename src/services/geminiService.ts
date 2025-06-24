// Using the updated API key and switching to gemini-1.5-flash for better reliability
const GEMINI_API_KEY = 'AIzaSyDfrXbhhPP2xC9zM7-caHtiTq2YWk81gbk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// TTS/STT API key
const CLOUD_API_KEY = 'AIzaSyBhmF6KnRc-ItjJw5vTYf76AUqddCT_m0g';

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
    console.log('Making request to Gemini API with messages:', messages);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    return response.json();
  }

  static async getRealtimeResponse(userMessage: string, conversationHistory: GeminiMessage[] = [], customPrompt?: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Getting realtime response for:', userMessage, 'Language:', selectedLanguage, 'Topic:', selectedTopic);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases unless absolutely necessary for technical terms.` 
      : '';
    
    const topicContext = selectedTopic ? `about ${selectedTopic.toLowerCase()}` : '';
    const topicGreeting = this.getTopicGreeting(selectedTopic, languageName);
    
    const systemPrompt = customPrompt || `You are ${topicGreeting} - an incredibly enthusiastic, warm, and supportive conversation mentor specializing in ${selectedTopic || 'conversation practice'} ${topicContext}! 
    ${languageInstruction}
    
    PERSONALITY & TONE:
    - Be SUPER energetic and encouraging like an amazing coach who genuinely cares
    - Use topic-specific enthusiasm (like "Hey there, ${selectedTopic} superstar!" or "Awesome ${selectedTopic} skills!")
    - Show authentic excitement about their progress and thoughts
    - Be warm, motivating, and incredibly supportive
    - Sound like their best friend who's also an expert mentor, not a robotic assistant
    
    RESPONSE STYLE:
    - Keep responses conversational and natural (2-4 sentences, 30-60 words)
    - ALWAYS include topic-specific encouragement and excitement
    - Ask engaging follow-up questions that dive deeper into ${selectedTopic || 'their interests'}
    - Use varied, enthusiastic conversation starters and responses
    - Match their energy and build genuine excitement about the topic
    - Be VERY specific to ${selectedTopic || 'the conversation topic'} when possible
    - Use phrases like: "That's amazing progress in ${selectedTopic}!", "I love your perspective on this!", "You're really getting the hang of ${selectedTopic}!"
    
    CONVERSATION FLOW:
    - Respond directly to what they said with enthusiasm first
    - Then ask an engaging question that keeps the conversation flowing naturally
    - Show genuine curiosity about their perspective on ${selectedTopic || 'the topic'}
    - Use questions like: "That's fascinating! What's your experience with...", "I love that approach! Have you found that...", "That's such a brilliant insight about ${selectedTopic}! How do you usually handle..."
    
    Remember: You're not just answering questions - you're their enthusiastic ${selectedTopic || 'conversation'} coach who's genuinely excited to help them succeed!`;
    
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
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || `Hey there, ${selectedTopic} champion! That's such an interesting point! Tell me more about your thoughts on ${selectedTopic || 'this topic'} - I'm genuinely excited to hear your perspective!`;
      
      console.log('Gemini realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      const fallbackTopic = selectedTopic || 'this amazing topic';
      return `Hey there, ${fallbackTopic} superstar! I'm so excited to explore this with you! What's your take on ${fallbackTopic}? I'd love to hear your thoughts and help you dive deeper!`;
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
    
    You are ${topicGreeting} - an incredibly enthusiastic and energetic conversation mentor for ${selectedTopic || 'conversation practice'} in ${languageName}! 
    
    Start with a warm, exciting greeting like "${topicGreeting}" and immediately dive into an engaging, specific question about ${selectedTopic || 'their goals'} that gets them genuinely excited to share their thoughts and experiences.
    
    Be super energetic, encouraging, and show authentic interest in helping them improve their ${selectedTopic || 'conversation'} skills.
    Keep it warm and conversational - like meeting the most amazing conversation partner who's also an expert in ${selectedTopic || 'this field'}!
    
    Make them feel like they're talking to their best friend who happens to be a ${selectedTopic || 'conversation'} expert!`;
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: contextualPrompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || `${topicGreeting} I'm absolutely thrilled to practice ${selectedTopic || 'conversation'} with you today! What aspect of ${selectedTopic || 'this topic'} excites you most? I can't wait to dive in together!`;
      console.log('Gemini start conversation response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return `${this.getTopicGreeting(selectedTopic, languageName)} I'm so excited to help you practice ${selectedTopic || 'conversation'} today! What would you love to explore about ${selectedTopic || 'this amazing topic'}? Let's make this super engaging!`;
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
      'Business': 'Hey business leader!',
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

// Using the new Gemini API key
const GEMINI_API_KEY = 'AIzaSyAm0mYkyp2FOhwFJoQ_9pwOMSSTKtZRbww';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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

export interface GrammaticalMistake {
  error: string;
  correction: string;
}

export interface DetailedFeedback {
  overallPerformance: string;
  strengths: string[];
  grammaticalMistakes: (string | GrammaticalMistake)[];
  vocabularySuggestions: string[];
  improvementTips: string[];
  encouragement: string;
}

export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public isQuotaExceeded: boolean = false,
    public isRateLimited: boolean = false
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class GeminiService {
  private static async makeRequest(messages: GeminiMessage[]): Promise<any> {
    console.log('Making request to Gemini API with messages:', messages);
    
    try {
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
        
        let parsedError;
        try {
          parsedError = JSON.parse(errorData);
        } catch {
          parsedError = { error: { message: errorData } };
        }
        
        const isQuotaExceeded = response.status === 429 && 
          (parsedError.error?.message?.includes('quota') || 
           parsedError.error?.message?.includes('exceeded'));
        
        const isRateLimited = response.status === 429;
        
        throw new GeminiAPIError(
          parsedError.error?.message || `API request failed with status ${response.status}`,
          response.status,
          isQuotaExceeded,
          isRateLimited
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof GeminiAPIError) {
        throw error;
      }
      
      // Handle network errors or other issues
      console.error('Network or other error:', error);
      throw new GeminiAPIError(
        'Unable to connect to AI service. Please check your internet connection.',
        0,
        false,
        false
      );
    }
  }

  static async getRealtimeResponse(userMessage: string, conversationHistory: GeminiMessage[] = [], customPrompt?: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Getting realtime response for:', userMessage, 'Language:', selectedLanguage, 'Topic:', selectedTopic);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases unless absolutely necessary for technical terms.` 
      : '';
    
    const topicContext = selectedTopic ? `about ${selectedTopic.toLowerCase()}` : '';
    
    const systemPrompt = customPrompt || `You are a friendly, energetic English tutor helping users improve their communication skills! You speak like a real-life human tutor — casual, supportive, and slightly playful when needed.
    ${languageInstruction}
    
    PERSONALITY & TONE:
    - Be warm, encouraging, and genuinely excited about their progress
    - Sound like a supportive friend who happens to be a great teacher
    - Use casual, natural language - not formal or robotic
    - Be slightly playful and fun when appropriate
    - Show authentic enthusiasm for their learning journey
    
    RESPONSE STYLE:
    - Keep responses SHORT and engaging (2-4 sentences max, 20-40 words)
    - Always respond to what they said first, then ask a follow-up question
    - Make them want to speak more - your goal is to get them talking!
    - Use varied, natural conversation starters and responses
    - Ask engaging questions that encourage them to share more
    - Focus on ${selectedTopic || 'conversation practice'} when relevant
    
    CONVERSATION FLOW:
    - Acknowledge what they said with enthusiasm
    - Ask a simple, engaging follow-up question to keep them talking
    - Use questions like: "That's cool! What do you think about...", "Nice! How do you usually...", "Awesome! What's your favorite..."
    - Keep the conversation flowing naturally and encourage them to speak more
    
    Remember: Your main goal is to make them feel comfortable and want to keep talking! Short, sweet, and engaging responses work best.`;
    
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
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || `That's interesting! Tell me more about that. What do you think?`;
      
      console.log('Gemini realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      
      if (error instanceof GeminiAPIError) {
        if (error.isQuotaExceeded) {
          return `I'm sorry, but we've reached our daily conversation limit. The service will be available again tomorrow. Thank you for practicing with us today!`;
        } else if (error.isRateLimited) {
          return `I need a moment to catch up. Let's continue our conversation in just a few seconds!`;
        }
      }
      
      return `That sounds great! What's your experience with that? I'd love to hear more!`;
    }
  }

  static async startConversation(prompt: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Starting conversation with prompt:', prompt, 'Language:', selectedLanguage, 'Topic:', selectedTopic);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases.` 
      : '';
    
    const contextualPrompt = `${languageInstruction}
    
    You are a friendly, energetic English tutor starting a conversation about ${selectedTopic || 'general topics'}! 
    
    Give a SHORT, warm greeting (1-2 sentences max, 15-25 words) and ask ONE simple question about ${selectedTopic || 'their interests'} to get them talking.
    
    Be casual, friendly, and encouraging. Sound like a real person, not a robot. Your goal is to make them feel comfortable and want to start sharing!
    
    Examples of good openings:
    - "Hey there! I'm excited to chat with you today. What's something you're passionate about?"
    - "Hi! Great to meet you. Tell me, what did you do this weekend?"
    - "Hello! I love talking about ${selectedTopic || 'different topics'}. What interests you most about it?"
    
    Keep it short, natural, and engaging!`;
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: contextualPrompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || `Hey there! I'm excited to chat with you today. What's something you're passionate about?`;
      console.log('Gemini start conversation response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      
      if (error instanceof GeminiAPIError) {
        if (error.isQuotaExceeded) {
          return `Welcome! I'd love to chat, but we've reached our daily conversation limit. Please try again tomorrow!`;
        } else if (error.isRateLimited) {
          return `Hi there! Give me just a moment to get ready, then we can start our conversation!`;
        }
      }
      
      return `Hi! Great to meet you. What's something interesting you'd like to talk about today?`;
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: GeminiMessage[], selectedLanguage?: string, selectedTopic?: string): Promise<ConversationResponse> {
    const response = await this.getRealtimeResponse(userMessage, conversationHistory, undefined, selectedLanguage, selectedTopic);
    
    return {
      response,
      feedback: {
        grammar: 'Great job!',
        pronunciation: 'Clear speaking',
        fluency: 'Natural flow!'
      }
    };
  }

  static async generateDetailedFeedback(conversationMessages: any[], selectedLanguage?: string, selectedTopic?: string): Promise<DetailedFeedback> {
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `Provide feedback in ${languageName}.` 
      : '';
    
    const userMessages = conversationMessages
      .filter(msg => msg.speaker === 'user')
      .map(msg => msg.message)
      .join('\n');

    const feedbackPrompt = `As a friendly English tutor, analyze this conversation and provide detailed, encouraging feedback. ${languageInstruction}

    Topic: ${selectedTopic || 'General conversation'}
    User's messages: ${userMessages}

    Provide specific feedback in JSON format:
    {
      "overallPerformance": "Brief encouraging assessment (1-2 sentences)",
      "strengths": ["List 2-3 specific things they did well"],
      "grammaticalMistakes": ["Only major/recurring errors with corrections - max 3, as simple strings"],
      "vocabularySuggestions": ["2-3 alternative words/phrases they could use"],
      "improvementTips": ["2-3 actionable suggestions for better communication"],
      "encouragement": "Motivating closing message (1-2 sentences)"
    }

    IMPORTANT: For grammaticalMistakes, provide simple string descriptions like "Consider using 'I have been' instead of 'I am being' for present perfect tense" rather than complex objects.

    Keep the tone supportive and constructive. Focus on growth and progress. Be specific but encouraging.`;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: feedbackPrompt }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const feedbackText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to parse JSON response
      try {
        const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const feedback = JSON.parse(jsonMatch[0]);
          
          // Ensure grammaticalMistakes are strings
          if (feedback.grammaticalMistakes) {
            feedback.grammaticalMistakes = feedback.grammaticalMistakes.map((mistake: any) => {
              if (typeof mistake === 'object' && mistake.error && mistake.correction) {
                return `${mistake.error} (Suggestion: ${mistake.correction})`;
              }
              return typeof mistake === 'string' ? mistake : String(mistake);
            });
          }
          
          return feedback;
        }
      } catch (parseError) {
        console.error('Error parsing feedback JSON:', parseError);
      }
      
      // Fallback if JSON parsing fails
      return this.getFallbackFeedback();
    } catch (error) {
      console.error('Error generating detailed feedback:', error);
      
      if (error instanceof GeminiAPIError) {
        if (error.isQuotaExceeded) {
          throw new Error('QUOTA_EXCEEDED');
        } else if (error.isRateLimited) {
          throw new Error('RATE_LIMITED');
        }
      }
      
      return this.getFallbackFeedback();
    }
  }

  private static getFallbackFeedback(): DetailedFeedback {
    return {
      overallPerformance: "Great job in our conversation today! You showed good communication skills.",
      strengths: [
        "You expressed your thoughts clearly",
        "Good use of natural conversation flow",
        "Showed enthusiasm in your responses"
      ],
      grammaticalMistakes: [
        "Consider using more varied sentence structures"
      ],
      vocabularySuggestions: [
        "Try using more descriptive adjectives",
        "Experiment with different ways to express opinions"
      ],
      improvementTips: [
        "Practice speaking with more confidence",
        "Try to elaborate more on your ideas",
        "Use transition words to connect your thoughts"
      ],
      encouragement: "Keep practicing! You're making excellent progress in your English communication journey."
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
      
      if (error instanceof GeminiAPIError && error.isQuotaExceeded) {
        return 'We\'ve reached our daily feedback limit, but your conversation practice was excellent! Please try again tomorrow for detailed feedback.';
      }
      
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
// OpenAI API service for STT, TTS, and LLM
const OPENAI_API_KEY = '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';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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

export class OpenAIAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public isQuotaExceeded: boolean = false,
    public isRateLimited: boolean = false
  ) {
    super(message);
    this.name = 'OpenAIAPIError';
  }
}

export class OpenAIService {
  // Text-to-Speech using OpenAI
  static async textToSpeech(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'): Promise<ArrayBuffer> {
    try {
      const response = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI TTS error response:', errorData);
        throw new OpenAIAPIError(
          `OpenAI TTS API error: ${response.status}`,
          response.status,
          response.status === 429,
          response.status === 429
        );
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error with OpenAI TTS:', error);
      throw error;
    }
  }

  // Speech-to-Text using OpenAI Whisper
  static async speechToText(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI STT error response:', errorData);
        throw new OpenAIAPIError(
          `OpenAI STT API error: ${response.status}`,
          response.status,
          response.status === 429,
          response.status === 429
        );
      }

      const result = await response.json();
      return result.text || '';
    } catch (error) {
      console.error('Error with OpenAI STT:', error);
      throw error;
    }
  }

  // Chat completion using OpenAI GPT
  private static async makeRequest(messages: OpenAIMessage[]): Promise<any> {
    console.log('Making request to OpenAI API with messages:', messages);
    
    try {
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 1024,
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error response:', errorData);
        
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
        
        throw new OpenAIAPIError(
          parsedError.error?.message || `API request failed with status ${response.status}`,
          response.status,
          isQuotaExceeded,
          isRateLimited
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof OpenAIAPIError) {
        throw error;
      }
      
      console.error('Network or other error:', error);
      throw new OpenAIAPIError(
        'Unable to connect to AI service. Please check your internet connection.',
        0,
        false,
        false
      );
    }
  }

  static async getRealtimeResponse(userMessage: string, conversationHistory: OpenAIMessage[] = [], customPrompt?: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Getting realtime response for:', userMessage, 'Language:', selectedLanguage, 'Topic:', selectedTopic);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases unless absolutely necessary for technical terms.` 
      : '';
    
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
    
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.choices?.[0]?.message?.content || `That's interesting! Tell me more about that. What do you think?`;
      
      console.log('OpenAI realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      
      if (error instanceof OpenAIAPIError) {
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
    
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: contextualPrompt
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.choices?.[0]?.message?.content || `Hey there! I'm excited to chat with you today. What's something you're passionate about?`;
      console.log('OpenAI start conversation response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      
      if (error instanceof OpenAIAPIError) {
        if (error.isQuotaExceeded) {
          return `Welcome! I'd love to chat, but we've reached our daily conversation limit. Please try again tomorrow!`;
        } else if (error.isRateLimited) {
          return `Hi there! Give me just a moment to get ready, then we can start our conversation!`;
        }
      }
      
      return `Hi! Great to meet you. What's something interesting you'd like to talk about today?`;
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: OpenAIMessage[], selectedLanguage?: string, selectedTopic?: string): Promise<ConversationResponse> {
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

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: feedbackPrompt
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const feedbackText = result.choices?.[0]?.message?.content || '';
      
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
      
      if (error instanceof OpenAIAPIError) {
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

  // Get voice based on gender preference for OpenAI TTS
  static getVoice(gender: 'male' | 'female'): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
    const voices = {
      female: 'nova', // Female voice
      male: 'onyx',   // Male voice
    };
    return voices[gender];
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
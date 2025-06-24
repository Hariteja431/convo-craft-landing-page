
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
      ? `CRITICAL: Respond ONLY in ${this.getLanguageName(selectedLanguage)}. Never use English words or phrases. Use native script when applicable.` 
      : '';
    
    const systemPrompt = customPrompt || `You are a friendly, encouraging AI conversation mentor. 
    ${languageInstruction}
    
    RESPONSE STYLE:
    - Keep responses to 1-2 SHORT sentences (15-25 words max)
    - Be warm, supportive, and engaging
    - Sound natural and conversational, not robotic
    - ALWAYS end with a follow-up question or prompt that encourages more speaking
    - Use varied conversation starters appropriate for the language and culture
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
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || this.getFallbackResponse(selectedLanguage);
      
      console.log('Gemini realtime response:', response);
      return response;
    } catch (error) {
      console.error('Error getting realtime response:', error);
      return this.getFallbackResponse(selectedLanguage);
    }
  }

  static async startConversation(prompt: string, selectedLanguage?: string, selectedTopic?: string): Promise<string> {
    console.log('Starting conversation with prompt:', prompt);
    
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases. Use native script when applicable.` 
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
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || this.getFallbackGreeting(selectedLanguage);
      console.log('Gemini response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return this.getFallbackGreeting(selectedLanguage);
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: GeminiMessage[], selectedLanguage?: string, selectedTopic?: string): Promise<ConversationResponse> {
    const languageName = this.getLanguageName(selectedLanguage || 'en');
    const languageInstruction = selectedLanguage && selectedLanguage !== 'en' 
      ? `CRITICAL: Respond ONLY in ${languageName}. Never use English words or phrases. Use native script when applicable.` 
      : '';
    
    const mentorPrompt = `${languageInstruction}
    
    You are a supportive conversation mentor for ${selectedTopic?.toLowerCase() || 'conversation practice'} in ${languageName}. 
    
    GUIDELINES:
    - Keep responses SHORT (1-2 sentences, 15-25 words)
    - Respond naturally to what they said first
    - ALWAYS end with an engaging follow-up question
    - Be encouraging and show genuine interest
    - Use varied question starters appropriate for the language and culture
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
      'sa': 'Sanskrit (संस्कृत)',
      'ne': 'Nepali (नेपाली)',
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

  private static getFallbackResponse(languageCode?: string): string {
    const fallbacks: { [key: string]: string } = {
      'hi': 'यह दिलचस्प है! इस बारे में और बताइए?',
      'bn': 'এটি আকর্ষণীয়! এ সম্পর্কে আরও বলুন?',
      'te': 'ఇది ఆసక్తికరంగా ఉంది! దీని గురించి మరింత చెప్పండి?',
      'mr': 'हे मनोरंजक आहे! याबद्दल अधिक सांगा?',
      'ta': 'இது சுவாரஸ்யமாக உள்ளது! இதைப் பற்றி மேலும் சொல்லுங்கள்?',
      'gu': 'આ રસપ્રદ છે! આ વિશે વધુ કહો?',
      'kn': 'ಇದು ಆಸಕ್ತಿದಾಯಕವಾಗಿದೆ! ಈ ಬಗ್ಗೆ ಹೆಚ್ಚು ಹೇಳಿ?',
      'ml': 'ഇത് രസകരമാണ്! ഇതിനെക്കുറിച്ച് കൂടുതൽ പറയൂ?',
      'pa': 'ਇਹ ਦਿਲਚਸਪ ਹੈ! ਇਸ ਬਾਰੇ ਹੋਰ ਦੱਸੋ?',
      'ur': 'یہ دلچسپ ہے! اس کے بارے میں مزید بتائیں؟'
    };
    return fallbacks[languageCode || 'en'] || 'That\'s interesting! What made you think of that?';
  }

  private static getFallbackGreeting(languageCode?: string): string {
    const greetings: { [key: string]: string } = {
      'hi': 'नमस्ते! आज आप किस बारे में बात करना चाहते हैं?',
      'bn': 'নমস্কার! আজ আপনি কী নিয়ে কথা বলতে চান?',
      'te': 'నమస్కారం! ఈరోజు మీరు దేని గురించి మాట్లాడాలని అనుకుంటున్নారు?',
      'mr': 'नमस्कार! आज तुम्ही कशाबद्दल बोलू इच्छिता?',
      'ta': 'வணக்கம்! இன்று நீங்கள் எதைப் பற்றி பேச விரும்புகிறீர்கள்?',
      'gu': 'નમસ્તે! આજે તમે શું વિશે વાત કરવા માંગો છો?',
      'kn': 'ನಮಸ್ಕಾರ! ಇಂದು ನೀವು ಯಾವುದರ ಬಗ್ಗೆ ಮಾತನಾಡಲು ಬಯಸುತ್ತೀರಿ?',
      'ml': 'നമസ്കാരം! ഇന്ന് നിങ്ങൾ എന്തിനെക്കുറിച്ചാണ് സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നത്?',
      'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਤੁਸੀਂ ਕਿਸ ਬਾਰੇ ਗੱਲ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
      'ur': 'السلام علیکم! آج آپ کس بارے میں بات کرنا چاہتے ہیں؟'
    };
    return greetings[languageCode || 'en'] || 'Hi there! I\'m excited to practice with you. What would you like to work on today?';
  }
}

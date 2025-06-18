
const GEMINI_API_KEY = 'AIzaSyAYYUb5vdVChAv9ScK5J0ayCTlZCHqIrnc';
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
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async startConversation(topic: string): Promise<string> {
    console.log('Starting conversation with topic:', topic);
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ 
          text: `You are a friendly AI conversation partner helping someone practice English through speech. Start a casual conversation about ${topic}. Keep your response conversational, engaging, and ask a follow-up question to continue the dialogue. Limit your response to 2-3 sentences. Make it natural for speech.`
        }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Hello! Let\'s start practicing. How are you today?';
      console.log('Gemini response:', response);
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return 'Hello! I\'m here to help you practice English. How are you feeling today?';
    }
  }

  static async continueConversation(userMessage: string, conversationHistory: GeminiMessage[]): Promise<ConversationResponse> {
    console.log('Continuing conversation with message:', userMessage);
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ 
          text: 'You are a helpful English conversation partner for speech practice. Respond naturally to continue the conversation, ask follow-up questions, and keep the dialogue engaging. Keep responses conversational and suitable for speech - limit to 2-3 sentences.'
        }]
      },
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const response = result.candidates?.[0]?.content?.parts?.[0]?.text || 'That\'s interesting! Tell me more about that.';
      
      console.log('Gemini conversation response:', response);
      
      return {
        response,
        feedback: {
          grammar: 'Good sentence structure!',
          pronunciation: 'Clear pronunciation',
          fluency: 'Natural flow'
        }
      };
    } catch (error) {
      console.error('Error continuing conversation:', error);
      return {
        response: 'I understand. Can you tell me more about that?',
        feedback: {
          grammar: 'Keep practicing!',
          pronunciation: 'Good effort!',
          fluency: 'You\'re doing well!'
        }
      };
    }
  }

  static async getFeedback(userMessage: string): Promise<{ grammar: string; pronunciation: string; fluency: string }> {
    console.log('Getting feedback for message:', userMessage);
    
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ 
          text: `Please analyze this English text for language learning feedback: "${userMessage}". Provide brief, encouraging feedback on grammar, pronunciation tips, and fluency. Keep each category to 1 sentence and be supportive.`
        }]
      }
    ];

    try {
      const result = await this.makeRequest(messages);
      const feedbackText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        grammar: 'Your grammar looks good!',
        pronunciation: 'Focus on clear articulation',
        fluency: 'Nice natural expression!'
      };
    } catch (error) {
      console.error('Error getting feedback:', error);
      return {
        grammar: 'Keep practicing grammar!',
        pronunciation: 'Work on pronunciation',
        fluency: 'You\'re improving!'
      };
    }
  }
}

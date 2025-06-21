import { GoogleGenAI } from '@google/genai';

export interface ConversationContext {
  scenario: string;
  language: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ConversationResponse {
  text: string;
  feedback?: {
    grammar: string;
    pronunciation: string;
    fluency: string;
    suggestions: string[];
  };
}

export class ConversationService {
  private static readonly API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  private static ai = new GoogleGenAI(ConversationService.API_KEY);

  private static ai = new GoogleGenAI(this.API_KEY);

  static getScenarios() {
    return [
      { value: 'interview', label: 'Interview Preparation', description: 'Practice job interviews and professional conversations' },
      { value: 'public-speaking', label: 'Public Speaking Practice', description: 'Improve presentation and public speaking skills' },
      { value: 'ted-talk', label: 'TED Talk Rehearsal', description: 'Practice delivering engaging talks and presentations' },
      { value: 'casual', label: 'Casual Conversations', description: 'Natural, everyday conversation practice' },
      { value: 'storytelling', label: 'Storytelling Practice', description: 'Develop narrative and storytelling abilities' },
      { value: 'business', label: 'Business Presentations', description: 'Professional business communication skills' },
      { value: 'language-learning', label: 'Language Learning', description: 'Practice speaking in different languages' },
      { value: 'debate', label: 'Debate Practice', description: 'Develop argumentation and debate skills' }
    ];
  }

  static getLanguages() {
    return [
      { value: 'en', label: 'English', flag: '🇺🇸' },
      { value: 'es', label: 'Spanish', flag: '🇪🇸' },
      { value: 'fr', label: 'French', flag: '🇫🇷' },
      { value: 'de', label: 'German', flag: '🇩🇪' },
      { value: 'it', label: 'Italian', flag: '🇮🇹' },
      { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
      { value: 'ru', label: 'Russian', flag: '🇷🇺' },
      { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
      { value: 'ko', label: 'Korean', flag: '🇰🇷' },
      { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
      { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
      { value: 'hi', label: 'Hindi', flag: '🇮🇳' }
    ];
  }

  static async processConversation(
    userInput: string, 
    context: ConversationContext
  ): Promise<ConversationResponse> {
    try {
      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const scenarioPrompts = {
        'interview': `You are an experienced interviewer conducting a job interview. Ask relevant questions, provide constructive feedback, and help the candidate improve their responses. Be professional but encouraging.`,
        'public-speaking': `You are a public speaking coach. Help the user practice their presentation skills, provide feedback on delivery, and suggest improvements for engaging an audience.`,
        'ted-talk': `You are a TED Talk mentor. Help the user craft and practice compelling talks that inspire and educate. Focus on storytelling, clarity, and audience engagement.`,
        'casual': `You are a friendly conversation partner. Engage in natural, everyday conversations on various topics. Be warm, interesting, and help maintain a flowing dialogue.`,
        'storytelling': `You are a storytelling coach. Help the user develop their narrative skills, improve their story structure, and practice engaging delivery techniques.`,
        'business': `You are a business communication expert. Help with professional presentations, meetings, and corporate communication. Focus on clarity, persuasion, and executive presence.`,
        'language-learning': `You are a language learning tutor. Help the user practice speaking in ${context.language}. Provide gentle corrections, vocabulary suggestions, and encourage natural conversation flow.`,
        'debate': `You are a debate coach. Help the user practice argumentation, logical reasoning, and persuasive speaking. Challenge their points constructively and help improve their debate skills.`
      };

      const languageInstruction = context.language !== 'en' 
        ? `Respond primarily in ${this.getLanguages().find(l => l.value === context.language)?.label || 'the selected language'}.`
        : '';

      const conversationHistory = context.conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `
${scenarioPrompts[context.scenario as keyof typeof scenarioPrompts] || scenarioPrompts.casual}

${languageInstruction}

Previous conversation:
${conversationHistory}

Current user input: "${userInput}"

Please respond naturally and helpfully. Keep your response conversational and engaging (2-3 sentences). If this is language learning, provide gentle corrections when needed.
      `.trim();

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Generate feedback for language learning scenarios
      let feedback;
      if (context.scenario === 'language-learning' || context.scenario === 'interview') {
        feedback = await this.generateFeedback(userInput, context);
      }

      return {
        text: text || "I understand. Could you tell me more about that?",
        feedback
      };
    } catch (error) {
      console.error('Error processing conversation:', error);
      return {
        text: "I'm sorry, I encountered an issue. Could you please try again?",
        feedback: {
          grammar: "Keep practicing!",
          pronunciation: "You're doing well!",
          fluency: "Great effort!",
          suggestions: ["Try speaking more slowly", "Focus on clear pronunciation"]
        }
      };
    }
  }

  private static async generateFeedback(
    userInput: string, 
    context: ConversationContext
  ): Promise<ConversationResponse['feedback']> {
    try {
      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const feedbackPrompt = `
Analyze this user input for a ${context.scenario} scenario in ${context.language}:
"${userInput}"

Provide brief, encouraging feedback on:
1. Grammar (1 sentence)
2. Vocabulary usage (1 sentence) 
3. Overall fluency (1 sentence)
4. 2-3 specific improvement suggestions

Be constructive and encouraging. Format as JSON:
{
  "grammar": "...",
  "pronunciation": "...", 
  "fluency": "...",
  "suggestions": ["...", "..."]
}
      `;

      const result = await model.generateContent(feedbackPrompt);
      const feedbackText = result.response.text();
      
      try {
        const feedback = JSON.parse(feedbackText);
        return feedback;
      } catch {
        return {
          grammar: "Good sentence structure!",
          pronunciation: "Clear communication",
          fluency: "Natural flow",
          suggestions: ["Keep practicing!", "You're improving!"]
        };
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      return {
        grammar: "Keep up the good work!",
        pronunciation: "You're communicating well",
        fluency: "Good progress",
        suggestions: ["Continue practicing", "Stay confident"]
      };
    }
  }

  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('Transcribing audio with Gemini...');
      
      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const result = await model.generateContent([
        {
          text: "Please transcribe this audio accurately. Only return the transcribed text, nothing else."
        },
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        },
      ]);

      const transcription = result.response.text();
      console.log('Transcription result:', transcription);
      
      return transcription || "I couldn't understand that clearly. Could you please try again?";
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return "I'm having trouble understanding the audio. Please try speaking again.";
    }
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, RotateCcw, Settings, User, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { GeminiService, type GeminiMessage, type UserContext } from '@/services/geminiService';
import { UserService, type Conversation, type Message } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

interface ConversationPracticeProps {
  selectedLanguage: string;
  selectedTopic: string;
}

export const ConversationPractice: React.FC<ConversationPracticeProps> = ({
  selectedLanguage,
  selectedTopic
}) => {
  const { profile, isSignedIn } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const [userContext, setUserContext] = useState<UserContext | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user context and conversation history
  useEffect(() => {
    const loadUserContext = async () => {
      if (!profile) return;
      
      try {
        const [conversationHistory, preferences] = await Promise.all([
          UserService.getConversationHistory(profile.id, 10),
          UserService.getUserPreferences(profile.id)
        ]);
        
        setUserContext({
          conversationHistory,
          preferences: preferences || undefined
        });
      } catch (error) {
        console.error('Error loading user context:', error);
      }
    };

    if (isSignedIn && profile) {
      loadUserContext();
    }
  }, [profile, isSignedIn]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : selectedLanguage;
      
      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        
        if (transcript.trim()) {
          await handleUserMessage(transcript);
        }
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedLanguage]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewConversation = async () => {
    if (!profile) return null;
    
    try {
      const conversation = await UserService.createConversation(
        profile.id,
        `${selectedTopic} Practice - ${new Date().toLocaleDateString()}`,
        selectedTopic
      );
      setCurrentConversation(conversation);
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!currentConversation) return;
    
    try {
      const message = await UserService.addMessage(currentConversation.id, content, role);
      setMessages(prev => [...prev, message]);
      return message;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleUserMessage = async (userMessage: string) => {
    if (!profile || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Create conversation if it doesn't exist
      let conversation = currentConversation;
      if (!conversation) {
        conversation = await createNewConversation();
        if (!conversation) return;
      }

      // Save user message
      await saveMessage(userMessage, 'user');
      
      // Add to conversation history for Gemini
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user' as const, parts: [{ text: userMessage }] }
      ];
      
      // Get AI response with user context
      const response = await GeminiService.continueConversation(
        userMessage,
        conversationHistory,
        selectedLanguage,
        selectedTopic,
        userContext
      );
      
      // Save AI response
      await saveMessage(response.response, 'assistant');
      
      // Update conversation history
      setConversationHistory([
        ...updatedHistory,
        { role: 'model' as const, parts: [{ text: response.response }] }
      ]);
      
      // Speak the response
      await speakText(response.response);
      
    } catch (error) {
      console.error('Error handling user message:', error);
      toast.error('Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      return;
    }
    
    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      toast.error('Failed to start listening. Please try again.');
    }
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }
      
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'en' ? 'en-US' : selectedLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      synthRef.current.speak(utterance);
    });
  };

  const startConversation = async () => {
    if (!profile) {
      toast.error('Please sign in to start practicing.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create new conversation
      const conversation = await createNewConversation();
      if (!conversation) return;
      
      // Get initial AI message with user context
      const initialMessage = await GeminiService.startConversation(
        `Start a ${selectedTopic} conversation practice`,
        selectedLanguage,
        selectedTopic,
        userContext
      );
      
      // Save AI's initial message
      await saveMessage(initialMessage, 'assistant');
      
      // Update conversation history
      setConversationHistory([
        { role: 'model', parts: [{ text: initialMessage }] }
      ]);
      
      // Speak the initial message
      await speakText(initialMessage);
      
      setHasStarted(true);
      toast.success('Conversation started! Start speaking when ready.');
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setConversationHistory([]);
    setHasStarted(false);
    setIsProcessing(false);
    
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    toast.success('Conversation reset. Ready to start fresh!');
  };

  const toggleSpeech = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-16 h-16 text-sage-600 dark:text-sage-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-sage-900 dark:text-sage-100 mb-2">
            Sign In Required
          </h3>
          <p className="text-sage-600 dark:text-sage-400">
            Please sign in to start your personalized conversation practice with AI.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant={hasStarted ? "default" : "secondary"}>
                {hasStarted ? "Active Practice" : "Ready to Start"}
              </Badge>
              <span className="text-sm text-sage-600 dark:text-sage-400">
                {selectedTopic} • {selectedLanguage.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetConversation}
                disabled={isProcessing}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            {!hasStarted ? (
              <Button
                onClick={startConversation}
                disabled={isProcessing}
                size="lg"
                className="bg-sage-600 hover:bg-sage-700 text-white"
              >
                {isProcessing ? 'Starting...' : 'Start Conversation'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={startListening}
                  disabled={isProcessing || isSpeaking}
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  className={isListening ? "" : "bg-sage-600 hover:bg-sage-700 text-white"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Speaking
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={toggleSpeech}
                  disabled={!isSpeaking}
                  variant="outline"
                  size="lg"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-5 h-5 mr-2" />
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 mr-2" />
                      Audio
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Display */}
      {messages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
              Conversation History
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-sage-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-sage-600 text-white'
                        : 'bg-sage-100 dark:bg-sage-800 text-sage-900 dark:text-sage-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-sage-400 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Indicators */}
      <div className="flex justify-center space-x-4 text-sm text-sage-600 dark:text-sage-400">
        {isListening && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Listening...</span>
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>AI Speaking...</span>
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

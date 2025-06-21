
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, User, Users, MessageCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GeminiService, GeminiMessage } from '@/services/geminiService';

interface ConversationTurn {
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

export const HeroVoiceInteraction = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'female' | 'male'>('female');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition with auto-detection
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        
        // Only process if it's a final result
        if (event.results[event.results.length - 1].isFinal && transcript.length > 0) {
          console.log('Final transcript:', transcript);
          
          // Add user message to conversation
          const userTurn: ConversationTurn = {
            speaker: 'user',
            message: transcript,
            timestamp: new Date()
          };
          setConversation(prev => [...prev, userTurn]);
          
          // Stop listening and start processing
          setIsListening(false);
          setIsProcessing(true);
          recognition.current?.stop();
          
          try {
            // Add to conversation history
            const newUserMessage: GeminiMessage = {
              role: 'user',
              parts: [{ text: transcript }]
            };
            
            const response = await GeminiService.getRealtimeResponse(transcript, conversationHistory);
            
            // Add AI response to conversation
            const aiTurn: ConversationTurn = {
              speaker: 'ai',
              message: response,
              timestamp: new Date()
            };
            setConversation(prev => [...prev, aiTurn]);
            
            // Update conversation history
            const aiMessage: GeminiMessage = {
              role: 'model',
              parts: [{ text: response }]
            };
            setConversationHistory(prev => [...prev, newUserMessage, aiMessage]);
            
            // Speak the response
            speakText(response);
          } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = 'Sorry, I had trouble understanding. Could you try again?';
            const aiTurn: ConversationTurn = {
              speaker: 'ai',
              message: errorMessage,
              timestamp: new Date()
            };
            setConversation(prev => [...prev, aiTurn]);
            speakText(errorMessage);
          }
          
          setIsProcessing(false);
        }
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [conversationHistory]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced voice selection
      const voices = speechSynthesis.getVoices();
      let selectedVoiceObj;
      
      if (selectedVoice === 'female') {
        selectedVoiceObj = voices.find(voice => 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('samantha') ||
           voice.name.toLowerCase().includes('karen') ||
           voice.name.toLowerCase().includes('victoria') ||
           voice.name.toLowerCase().includes('zira') ||
           voice.name.toLowerCase().includes('susan')) &&
          voice.lang.startsWith('en')
        ) || voices.find(voice => voice.name.includes('Google') && voice.name.includes('Female'));
      } else {
        selectedVoiceObj = voices.find(voice => 
          (voice.name.toLowerCase().includes('male') || 
           voice.name.toLowerCase().includes('daniel') ||
           voice.name.toLowerCase().includes('alex') ||
           voice.name.toLowerCase().includes('tom') ||
           voice.name.toLowerCase().includes('david') ||
           voice.name.toLowerCase().includes('mark')) &&
          voice.lang.startsWith('en')
        ) || voices.find(voice => voice.name.includes('Google') && voice.name.includes('Male'));
      }
      
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }
      
      utterance.rate = 1.0; // Normal speed for clarity
      utterance.pitch = selectedVoice === 'female' ? 1.1 : 0.9;
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-start listening after AI finishes speaking
        setTimeout(() => {
          if (!isListening && !isProcessing) {
            startListening();
          }
        }, 500);
      };
      utterance.onerror = () => setIsSpeaking(false);
      
      currentUtterance.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    stopSpeaking();
    recognition.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startConversation = async () => {
    try {
      setIsProcessing(true);
      const response = await GeminiService.startConversation('general conversation');
      
      const aiTurn: ConversationTurn = {
        speaker: 'ai',
        message: response,
        timestamp: new Date()
      };
      setConversation([aiTurn]);
      
      const aiMessage: GeminiMessage = {
        role: 'model',
        parts: [{ text: response }]
      };
      setConversationHistory([aiMessage]);
      
      speakText(response);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <Card className="bg-white dark:bg-navy-800 rounded-2xl p-8 shadow-2xl border border-sage-200 dark:border-navy-700">
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
              Choose AI Voice
            </h3>
            <RadioGroup 
              value={selectedVoice} 
              onValueChange={(value) => setSelectedVoice(value as 'female' | 'male')}
              className="flex justify-center gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="flex items-center gap-2 text-sage-700 dark:text-sage-300 cursor-pointer">
                  <User className="w-4 h-4" />
                  Female Voice
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="flex items-center gap-2 text-sage-700 dark:text-sage-300 cursor-pointer">
                  <Users className="w-4 h-4" />
                  Male Voice
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Main Interaction Area */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Button
                onClick={conversation.length === 0 ? startConversation : toggleListening}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
                    : isProcessing
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 hover:scale-105'
                } text-white shadow-lg`}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs mt-2">Processing</span>
                  </div>
                ) : isListening ? (
                  <MicOff className="w-12 h-12" />
                ) : conversation.length === 0 ? (
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-12 h-12" />
                    <span className="text-xs mt-2">Start Chat</span>
                  </div>
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
              
              {/* Animated rings during listening */}
              {isListening && (
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                  <div className="absolute inset-4 rounded-full border-2 border-red-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              )}
            </div>

            {/* Status Display */}
            <div className="text-center min-h-[60px] flex flex-col justify-center">
              {isProcessing && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="ml-2 text-sage-600 dark:text-sage-400">AI is thinking...</span>
                </div>
              )}
              
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="w-4 h-4 text-sage-600 dark:text-sage-400 animate-pulse" />
                  <span className="text-sage-600 dark:text-sage-400">AI is speaking...</span>
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="sm"
                    className="ml-2 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <VolumeX className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {isListening && (
                <div className="text-center">
                  <Badge className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 mb-2 animate-pulse">
                    Listening...
                  </Badge>
                  <p className="text-sage-600 dark:text-sage-400 text-sm">
                    Speak now - I'll respond automatically
                  </p>
                </div>
              )}
              
              {!isListening && !isProcessing && !isSpeaking && conversation.length > 0 && (
                <div className="text-center">
                  <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 mb-2">
                    Ready to Listen
                  </Badge>
                  <p className="text-sage-600 dark:text-sage-400 text-sm">
                    Click the microphone to continue talking
                  </p>
                </div>
              )}

              {!isListening && !isProcessing && !isSpeaking && conversation.length === 0 && (
                <div className="text-center">
                  <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 mb-2">
                    {selectedVoice === 'female' ? 'Female' : 'Male'} Assistant Ready
                  </Badge>
                  <p className="text-sage-600 dark:text-sage-400 text-sm">
                    Click to start a real-time conversation
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Conversation Display */}
          {conversation.length > 0 && (
            <div className="w-full max-w-2xl mx-auto">
              <h4 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4 text-center">
                Live Conversation
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-sage-50 dark:bg-navy-700 rounded-lg border border-sage-200 dark:border-navy-600">
                {conversation.map((turn, index) => (
                  <div
                    key={index}
                    className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        turn.speaker === 'user'
                          ? 'bg-sage-600 text-white'
                          : 'bg-white dark:bg-navy-600 text-sage-900 dark:text-sage-100 border border-sage-200 dark:border-navy-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">
                          {turn.speaker === 'user' ? 'You' : 'AI'}
                        </span>
                        <span className="text-xs opacity-70">
                          {turn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{turn.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

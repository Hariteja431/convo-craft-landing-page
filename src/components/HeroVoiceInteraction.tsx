import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, User, Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { GeminiService } from '@/services/geminiService';

export const HeroVoiceInteraction = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'female' | 'male'>('female');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setLastMessage(`You: ${transcript}`);
        setIsListening(false);
        setIsProcessing(true);
        
        try {
          const response = await GeminiService.startConversation(transcript);
          setLastMessage(`AI: ${response}`);
          speakText(response);
        } catch (error) {
          console.error('Error getting AI response:', error);
          setLastMessage('AI: Sorry, I encountered an error. Please try again.');
        }
        
        setIsProcessing(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on selection
      const voices = speechSynthesis.getVoices();
      let selectedVoiceObj;
      
      if (selectedVoice === 'female') {
        selectedVoiceObj = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('victoria') ||
          (voice.gender && voice.gender === 'female')
        ) || voices.find(voice => voice.name.includes('Google US English') && voice.name.includes('Female'));
      } else {
        selectedVoiceObj = voices.find(voice => 
          voice.name.toLowerCase().includes('male') || 
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('alex') ||
          voice.name.toLowerCase().includes('tom') ||
          (voice.gender && voice.gender === 'male')
        ) || voices.find(voice => voice.name.includes('Google US English') && voice.name.includes('Male'));
      }
      
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = selectedVoice === 'female' ? 1.1 : 0.9;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
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

  const toggleListening = () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      recognition.current.start();
      setIsListening(true);
      setLastMessage('');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Card className="bg-white dark:bg-navy-800 rounded-xl p-4 sm:p-6 shadow-xl border border-sage-200 dark:border-navy-700">
        <CardContent className="space-y-4 sm:space-y-6 p-0">
          {/* Main Interaction Area */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="relative">
              <Button
                onClick={toggleListening}
                disabled={isProcessing || isSpeaking}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
                    : 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 hover:scale-105'
                } text-white shadow-lg`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : (
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
                )}
              </Button>
              
              {/* Animated rings during listening */}
              {isListening && (
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-red-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              )}
            </div>

            {/* Status Display */}
            <div className="text-center min-h-[40px] sm:min-h-[50px] flex flex-col justify-center">
              {isProcessing && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="ml-2 text-sage-600 dark:text-sage-400 text-sm sm:text-base">Processing...</span>
                </div>
              )}
              
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2">
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-sage-600 dark:text-sage-400 animate-pulse" />
                  <span className="text-sage-600 dark:text-sage-400 text-sm sm:text-base">AI is speaking...</span>
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="sm"
                    className="ml-2 border-red-300 text-red-600 hover:bg-red-50 h-6 px-2 text-xs"
                  >
                    <VolumeX className="w-2 h-2 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              )}
              
              {!isListening && !isProcessing && !isSpeaking && (
                <div className="text-center">
                  <p className="text-sage-600 dark:text-sage-400 text-xs sm:text-sm">
                    Click the microphone to start speaking
                  </p>
                </div>
              )}
            </div>

            {/* Last Message Display */}
            {lastMessage && (
              <div className="w-full p-3 sm:p-4 bg-sage-50 dark:bg-navy-700 rounded-lg border border-sage-200 dark:border-navy-600">
                <p className="text-xs sm:text-sm text-sage-700 dark:text-sage-300 text-center animate-fade-in break-words">
                  {lastMessage}
                </p>
              </div>
            )}
          </div>

          {/* Voice Selection */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-sage-900 dark:text-sage-100 mb-3 sm:mb-4">
              Choose Your AI Assistant Voice
            </h3>
            <RadioGroup 
              value={selectedVoice} 
              onValueChange={(value) => setSelectedVoice(value as 'female' | 'male')}
              className="flex justify-center gap-4 sm:gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" className="border-sage-400 text-sage-600" />
                <Label htmlFor="female" className="flex items-center gap-2 text-sage-700 dark:text-sage-300 cursor-pointer text-sm sm:text-base">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 dark:text-pink-400 text-xs sm:text-sm">♀</span>
                  </div>
                  <span className="hidden sm:inline">Female Voice</span>
                  <span className="sm:hidden">Female</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" className="border-sage-400 text-sage-600" />
                <Label htmlFor="male" className="flex items-center gap-2 text-sage-700 dark:text-sage-300 cursor-pointer text-sm sm:text-base">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm">♂</span>
                  </div>
                  <span className="hidden sm:inline">Male Voice</span>
                  <span className="sm:hidden">Male</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
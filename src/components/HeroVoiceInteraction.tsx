
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
    <div className="relative">
      <Card className="bg-white dark:bg-navy-800 rounded-2xl p-8 shadow-2xl border border-sage-200 dark:border-navy-700">
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
              Choose Your AI Assistant Voice
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
                onClick={toggleListening}
                disabled={isProcessing || isSpeaking}
                className={`w-32 h-32 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
                    : 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 hover:scale-105'
                } text-white shadow-lg`}
              >
                {isListening ? (
                  <MicOff className="w-12 h-12" />
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
                  <span className="ml-2 text-sage-600 dark:text-sage-400">Processing...</span>
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
              
              {!isListening && !isProcessing && !isSpeaking && (
                <div className="text-center">
                  <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 mb-2">
                    {selectedVoice === 'female' ? 'Female' : 'Male'} Assistant Ready
                  </Badge>
                  <p className="text-sage-600 dark:text-sage-400 text-sm">
                    Click the microphone to start speaking
                  </p>
                </div>
              )}
            </div>

            {/* Last Message Display */}
            {lastMessage && (
              <div className="w-full max-w-md p-4 bg-sage-50 dark:bg-navy-700 rounded-lg border border-sage-200 dark:border-navy-600">
                <p className="text-sm text-sage-700 dark:text-sage-300 text-center animate-fade-in">
                  {lastMessage}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

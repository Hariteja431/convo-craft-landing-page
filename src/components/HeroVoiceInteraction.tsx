
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, User, Users, MessageCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeminiService, GeminiMessage } from '@/services/geminiService';

interface ConversationTurn {
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const PRACTICE_SCENARIOS = [
  'Casual Conversation',
  'Job Interview Practice',
  'Business Meeting',
  'Public Speaking',
  'Presentation Skills',
  'Podcast Interview',
  'Customer Service',
  'Sales Pitch',
  'Academic Discussion',
  'Debate Practice',
  'Storytelling'
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' }
];

export const HeroVoiceInteraction = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'female' | 'male'>('female');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrame = useRef<number | null>(null);

  // Cleanup function to stop all audio activities
  const cleanupAudio = () => {
    if (recognition.current) {
      recognition.current.stop();
      recognition.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsListening(false);
    stopAudioAnalysis();
  };

  // Cleanup when component unmounts or user leaves
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Initialize speech recognition and audio analysis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = selectedLanguage + '-US';

      recognition.current.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        
        if (event.results[event.results.length - 1].isFinal && transcript.length > 0) {
          console.log('Final transcript:', transcript);
          
          const userTurn: ConversationTurn = {
            speaker: 'user',
            message: transcript,
            timestamp: new Date()
          };
          setConversation(prev => [...prev, userTurn]);
          
          setIsListening(false);
          setIsProcessing(true);
          stopAudioAnalysis();
          recognition.current?.stop();
          
          try {
            const newUserMessage: GeminiMessage = {
              role: 'user',
              parts: [{ text: transcript }]
            };
            
            const mentorPrompt = `You are an expert communication mentor helping someone practice ${selectedTopic.toLowerCase()}. 
            Respond naturally and then ask an engaging follow-up question to keep the conversation flowing. 
            Be encouraging, provide gentle guidance when needed, and make the practice session engaging.
            Keep responses conversational but add value as a mentor. End with a question or prompt that encourages the user to continue speaking.`;
            
            const response = await GeminiService.getRealtimeResponse(transcript, conversationHistory, mentorPrompt);
            
            const aiTurn: ConversationTurn = {
              speaker: 'ai',
              message: response,
              timestamp: new Date()
            };
            setConversation(prev => [...prev, aiTurn]);
            
            const aiMessage: GeminiMessage = {
              role: 'model',
              parts: [{ text: response }]
            };
            setConversationHistory(prev => [...prev, newUserMessage, aiMessage]);
            
            speakText(response);
          } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = 'I understand. Could you elaborate on that?';
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
        console.error('Speech recognition error:', event);
        setIsListening(false);
        setIsProcessing(false);
        stopAudioAnalysis();
      };

      recognition.current.onend = () => {
        setIsListening(false);
        stopAudioAnalysis();
      };
    }
  }, [conversationHistory, selectedLanguage, selectedTopic]);

  const setupAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Fixed: Use proper AudioContext constructor
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      
      analyser.current.fftSize = 256;
      microphone.current.connect(analyser.current);
      
      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyser.current && isListening) {
          analyser.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationFrame.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    setAudioLevel(0);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        let selectedVoiceObj;
        
        if (selectedVoice === 'female') {
          // Enhanced female voice selection with more natural options
          selectedVoiceObj = voices.find(voice => 
            (voice.name.toLowerCase().includes('samantha') ||
             voice.name.toLowerCase().includes('karen') ||
             voice.name.toLowerCase().includes('victoria') ||
             voice.name.toLowerCase().includes('zira') ||
             voice.name.toLowerCase().includes('susan') ||
             voice.name.toLowerCase().includes('anna') ||
             voice.name.toLowerCase().includes('emma') ||
             voice.name.toLowerCase().includes('serena') ||
             voice.name.toLowerCase().includes('aria') ||
             voice.name.toLowerCase().includes('allison') ||
             voice.name.toLowerCase().includes('ava') ||
             voice.name.toLowerCase().includes('kate')) &&
            voice.lang.startsWith(selectedLanguage)
          ) || voices.find(voice => 
            voice.lang.startsWith(selectedLanguage) && 
            !voice.name.toLowerCase().includes('male') &&
            voice.name.toLowerCase().includes('female')
          );
        } else {
          // Enhanced male voice selection with more natural options
          selectedVoiceObj = voices.find(voice => 
            (voice.name.toLowerCase().includes('daniel') ||
             voice.name.toLowerCase().includes('alex') ||
             voice.name.toLowerCase().includes('tom') ||
             voice.name.toLowerCase().includes('david') ||
             voice.name.toLowerCase().includes('mark') ||
             voice.name.toLowerCase().includes('james') ||
             voice.name.toLowerCase().includes('ryan') ||
             voice.name.toLowerCase().includes('aaron') ||
             voice.name.toLowerCase().includes('nathan') ||
             voice.name.toLowerCase().includes('fred') ||
             voice.name.toLowerCase().includes('jorge')) &&
            voice.lang.startsWith(selectedLanguage)
          ) || voices.find(voice => 
            voice.lang.startsWith(selectedLanguage) && 
            voice.name.toLowerCase().includes('male')
          );
        }
        
        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
        }
        
        // Enhanced voice settings for more natural speech
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = selectedVoice === 'female' ? 1.2 : 0.8; // More distinct pitch difference
        utterance.volume = 0.85;
        utterance.lang = selectedLanguage + '-US';
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          setTimeout(() => {
            if (!isListening && !isProcessing && hasStarted) {
              startListening();
            }
          }, 500);
        };
        utterance.onerror = () => setIsSpeaking(false);
        
        currentUtterance.current = utterance;
        speechSynthesis.speak(utterance);
      };

      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = setVoice;
      } else {
        setVoice();
      }
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = async () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    stopSpeaking();
    await setupAudioAnalysis();
    recognition.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
      stopAudioAnalysis();
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
    if (!selectedTopic || !selectedLanguage) {
      alert('Please select both language and conversation topic');
      return;
    }

    try {
      setIsProcessing(true);
      setHasStarted(true);
      
      const languageName = LANGUAGES.find(lang => lang.code === selectedLanguage)?.name || 'English';
      const mentorGreeting = `Hello! I'm your communication mentor for ${selectedTopic.toLowerCase()} practice in ${languageName}. I'm here to help you improve your skills through engaging conversation. Let's start - what would you like to focus on in your ${selectedTopic.toLowerCase()} journey today?`;
      
      const aiTurn: ConversationTurn = {
        speaker: 'ai',
        message: mentorGreeting,
        timestamp: new Date()
      };
      setConversation([aiTurn]);
      
      const aiMessage: GeminiMessage = {
        role: 'model',
        parts: [{ text: mentorGreeting }]
      };
      setConversationHistory([aiMessage]);
      
      speakText(mentorGreeting);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsProcessing(false);
    }
  };

  const resetConversation = () => {
    cleanupAudio();
    setConversation([]);
    setConversationHistory([]);
    setHasStarted(false);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-sage-200 dark:border-navy-700">
        <CardContent className="p-8 space-y-8">
          {/* Settings Section */}
          {!hasStarted && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-sage-900 dark:text-sage-100 mb-2">
                  Start Your Conversation Practice
                </h2>
                <p className="text-sage-600 dark:text-sage-400">
                  Choose your preferences and start practicing with your AI mentor
                </p>
              </div>

              {/* Modern Voice Selection Toggle */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
                  AI Voice Assistant
                </h3>
                <div className="flex justify-center">
                  <div className="relative bg-sage-100 dark:bg-navy-700 rounded-full p-1 flex">
                    <div 
                      className={`absolute top-1 bottom-1 bg-sage-600 rounded-full transition-all duration-300 ${
                        selectedVoice === 'female' ? 'left-1 right-1/2' : 'left-1/2 right-1'
                      }`}
                    ></div>
                    <button
                      onClick={() => setSelectedVoice('female')}
                      className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                        selectedVoice === 'female'
                          ? 'text-white'
                          : 'text-sage-600 dark:text-sage-300'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Female Voice
                    </button>
                    <button
                      onClick={() => setSelectedVoice('male')}
                      className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                        selectedVoice === 'male'
                          ? 'text-white'
                          : 'text-sage-600 dark:text-sage-300'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Male Voice
                    </button>
                  </div>
                </div>
              </div>

              {/* Language and Topic Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-lg font-medium text-sage-900 dark:text-sage-100 mb-3 block">
                    Practice Language
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Choose language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg font-medium text-sage-900 dark:text-sage-100 mb-3 block">
                    Conversation Topic
                  </Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Choose topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRACTICE_SCENARIOS.map((scenario) => (
                        <SelectItem key={scenario} value={scenario}>
                          {scenario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <Button
                  onClick={startConversation}
                  disabled={!selectedTopic || !selectedLanguage || isProcessing}
                  className="w-64 h-16 text-xl bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white rounded-xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-6 h-6" />
                      Start Conversation
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Conversation Interface */}
          {hasStarted && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300">
                    {selectedTopic} • {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                  </Badge>
                  <Badge className="ml-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300">
                    {selectedVoice === 'female' ? '👩' : '👨'} {selectedVoice} Voice
                  </Badge>
                </div>
                <Button 
                  onClick={resetConversation} 
                  variant="outline" 
                  disabled={isProcessing}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                >
                  New Conversation
                </Button>
              </div>

              {/* Enhanced Listening Animation */}
              <div className="text-center">
                <div className="relative flex items-center justify-center">
                  {/* Outer pulse rings */}
                  {isListening && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-sage-300 dark:border-sage-500 animate-ping"
                        style={{ 
                          transform: `scale(${1.2 + audioLevel * 0.8})`,
                          opacity: audioLevel * 0.6 
                        }}
                      ></div>
                      <div 
                        className="absolute inset-4 rounded-full border-2 border-sage-400 dark:border-sage-400 animate-ping" 
                        style={{ 
                          animationDelay: '0.5s', 
                          transform: `scale(${1.1 + audioLevel * 0.6})`,
                          opacity: audioLevel * 0.4 
                        }}
                      ></div>
                    </>
                  )}
                  
                  {/* Main button */}
                  <div 
                    className={`w-32 h-32 rounded-full transition-all duration-300 ${
                      isListening 
                        ? 'bg-gradient-to-br from-sage-400 via-sage-500 to-sage-700 dark:from-sage-500 dark:via-sage-600 dark:to-sage-800' 
                        : isProcessing
                        ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-br from-sage-500 via-sage-600 to-sage-800 hover:scale-105'
                    } shadow-xl flex items-center justify-center cursor-pointer`}
                    onClick={!isProcessing ? toggleListening : undefined}
                    style={{
                      transform: isListening ? `scale(${1.05 + audioLevel * 0.2})` : undefined,
                      boxShadow: isListening 
                        ? `0 0 ${30 + audioLevel * 40}px rgba(34, 197, 94, ${0.3 + audioLevel * 0.4})` 
                        : undefined
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center text-white">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs mt-2 font-medium">Processing</span>
                      </div>
                    ) : isListening ? (
                      <MicOff className="w-12 h-12 text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                  </div>
                </div>

                {/* Status Display */}
                <div className="mt-6 min-h-[80px] flex flex-col justify-center">
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="ml-2 text-sage-600 dark:text-sage-400 font-medium">AI mentor is thinking...</span>
                    </div>
                  )}
                  
                  {isSpeaking && (
                    <div className="flex items-center justify-center gap-3">
                      <Volume2 className="w-5 h-5 text-sage-600 dark:text-sage-400 animate-pulse" />
                      <span className="text-sage-600 dark:text-sage-400 font-medium">AI mentor is speaking...</span>
                      <Button
                        onClick={stopSpeaking}
                        variant="outline"
                        size="sm"
                        className="ml-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <VolumeX className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  {isListening && (
                    <div className="text-center">
                      <Badge className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 mb-3 animate-pulse px-4 py-2">
                        🎤 Listening...
                      </Badge>
                      <p className="text-sage-600 dark:text-sage-400 text-sm font-medium">
                        Speak now - Your mentor will respond automatically
                      </p>
                      <div className="mt-2 bg-green-100 dark:bg-green-900/30 rounded-full h-2 w-32 mx-auto overflow-hidden">
                        <div 
                          className="bg-green-500 h-full transition-all duration-100"
                          style={{ width: `${audioLevel * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {!isListening && !isProcessing && !isSpeaking && (
                    <div className="text-center">
                      <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 mb-3 px-4 py-2">
                        Ready to Listen
                      </Badge>
                      <p className="text-sage-600 dark:text-sage-400 text-sm font-medium">
                        Click the microphone to continue your practice session
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Conversation Display */}
          {conversation.length > 0 && (
            <div className="w-full">
              <h4 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4 text-center">
                Live Conversation with Your AI Mentor
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
                          {turn.speaker === 'user' ? 'You' : 'AI Mentor'}
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

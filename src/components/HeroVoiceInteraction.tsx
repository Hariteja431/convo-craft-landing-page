import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, User, Users, MessageCircle, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OpenAIService, OpenAIMessage, DetailedFeedback } from '@/services/openAIService';
import { FeedbackModal } from '@/components/FeedbackModal';
import { useUser } from '@clerk/clerk-react';
import { SignInButton } from '@clerk/clerk-react';

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
  { code: 'en', name: 'English', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', speechCode: 'de-DE' },
  { code: 'it', name: 'Italian', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', speechCode: 'pt-PT' },
  { code: 'zh', name: 'Chinese', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Japanese', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', speechCode: 'ko-KR' },
  { code: 'ar', name: 'Arabic', speechCode: 'ar-SA' }
];

export const HeroVoiceInteraction = () => {
  const { isSignedIn, user } = useUser();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'female' | 'male'>('female');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [conversationHistory, setConversationHistory] = useState<OpenAIMessage[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [detailedFeedback, setDetailedFeedback] = useState<DetailedFeedback | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  // Cleanup function to stop all audio activities
  const cleanupAudio = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    if (currentAudioSource.current) {
      currentAudioSource.current.stop();
      currentAudioSource.current = null;
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    setIsSpeaking(false);
    setIsListening(false);
    stopAudioAnalysis();
  };

  // Cleanup when component unmounts or user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupAudio();
    };

    const handlePopState = () => {
      cleanupAudio();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      cleanupAudio();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const setupAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
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

  const speakTextWithOpenAI = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Stop any current audio
      if (currentAudioSource.current) {
        currentAudioSource.current.stop();
      }
      
      const voice = OpenAIService.getVoice(selectedVoice);
      const audioBuffer = await OpenAIService.textToSpeech(text, voice);
      
      // Create audio context if not exists
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioBufferDecoded = await audioContext.current.decodeAudioData(audioBuffer);
      const source = audioContext.current.createBufferSource();
      source.buffer = audioBufferDecoded;
      source.connect(audioContext.current.destination);
      
      currentAudioSource.current = source;
      
      source.onended = () => {
        setIsSpeaking(false);
        currentAudioSource.current = null;
        setTimeout(() => {
          if (!isListening && !isProcessing && hasStarted && !quotaExceeded) {
            startListening();
          }
        }, 800);
      };
      
      source.start();
    } catch (error) {
      console.error('Error with OpenAI TTS:', error);
      setIsSpeaking(false);
      // Fallback to browser speech synthesis
      fallbackToSpeechSynthesis(text);
    }
  };

  const fallbackToSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const setVoice = () => {
        const voices = speechSynthesis.getVoices();
        const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage);
        const langCode = selectedLang?.speechCode || 'en-US';
        
        let selectedVoiceObj;
        
        if (selectedVoice === 'female') {
          const femalePatterns = [
            'zira', 'susan', 'catherine', 'samantha', 'karen', 'victoria', 'anna', 'emma', 
            'serena', 'aria', 'allison', 'ava', 'kate', 'helena', 'monica', 'paloma', 
            'paulina', 'female', 'woman'
          ];
          
          selectedVoiceObj = voices.find(voice => 
            voice.lang.startsWith(selectedLanguage) &&
            femalePatterns.some(pattern => voice.name.toLowerCase().includes(pattern)) &&
            !voice.name.toLowerCase().includes('male')
          );
        } else {
          const malePatterns = [
            'david', 'mark', 'james', 'ryan', 'aaron', 'nathan', 'fred', 'jorge', 
            'diego', 'carlos', 'male', 'man', 'thomas', 'alex', 'daniel', 'tom'
          ];
          
          selectedVoiceObj = voices.find(voice => 
            voice.lang.startsWith(selectedLanguage) &&
            malePatterns.some(pattern => voice.name.toLowerCase().includes(pattern))
          );
        }
        
        if (!selectedVoiceObj) {
          selectedVoiceObj = voices.find(voice => voice.lang.startsWith(selectedLanguage));
        }
        
        if (selectedVoiceObj) {
          utterance.voice = selectedVoiceObj;
        }
        
        utterance.rate = 0.85;
        utterance.pitch = selectedVoice === 'female' ? 1.1 : 0.9;
        utterance.volume = 0.9;
        utterance.lang = langCode;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          setTimeout(() => {
            if (!isListening && !isProcessing && hasStarted && !quotaExceeded) {
              startListening();
            }
          }, 800);
        };
        utterance.onerror = () => setIsSpeaking(false);
        
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
    if (currentAudioSource.current) {
      currentAudioSource.current.stop();
      currentAudioSource.current = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startListening = async () => {
    if (quotaExceeded) {
      setShowQuotaWarning(true);
      return;
    }

    try {
      stopSpeaking();
      await setupAudioAnalysis();
      
      // Setup MediaRecorder for OpenAI Whisper
      if (mediaStream.current) {
        audioChunks.current = [];
        mediaRecorder.current = new MediaRecorder(mediaStream.current);
        
        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };
        
        mediaRecorder.current.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          
          try {
            setIsProcessing(true);
            const transcript = await OpenAIService.speechToText(audioBlob);
            
            if (transcript.trim()) {
              console.log('Transcribed text:', transcript);
              
              const userTurn: ConversationTurn = {
                speaker: 'user',
                message: transcript,
                timestamp: new Date()
              };
              setConversation(prev => [...prev, userTurn]);
              
              // Get AI response
              const newUserMessage: OpenAIMessage = {
                role: 'user',
                content: transcript
              };
              
              const result = await OpenAIService.continueConversation(
                transcript, 
                conversationHistory, 
                selectedLanguage, 
                selectedTopic
              );
              
              // Check if the response indicates quota exceeded
              if (result.response.includes('daily conversation limit') || result.response.includes('daily limit')) {
                setQuotaExceeded(true);
                setShowQuotaWarning(true);
              }
              
              const aiTurn: ConversationTurn = {
                speaker: 'ai',
                message: result.response,
                timestamp: new Date()
              };
              setConversation(prev => [...prev, aiTurn]);
              
              const aiMessage: OpenAIMessage = {
                role: 'assistant',
                content: result.response
              };
              setConversationHistory(prev => [...prev, newUserMessage, aiMessage]);
              
              await speakTextWithOpenAI(result.response);
            }
          } catch (error) {
            console.error('Error processing speech:', error);
            const errorMessage = 'That\'s interesting! Tell me more about that.';
            const aiTurn: ConversationTurn = {
              speaker: 'ai',
              message: errorMessage,
              timestamp: new Date()
            };
            setConversation(prev => [...prev, aiTurn]);
            await speakTextWithOpenAI(errorMessage);
          }
          
          setIsProcessing(false);
        };
        
        mediaRecorder.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopListening = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    setIsListening(false);
    stopAudioAnalysis();
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

    if (!isSignedIn) {
      alert('Please sign in to start practicing');
      return;
    }

    try {
      setIsProcessing(true);
      setHasStarted(true);
      setQuotaExceeded(false);
      setShowQuotaWarning(false);
      
      const aiResponse = await OpenAIService.startConversation('', selectedLanguage, selectedTopic);
      
      // Check if the response indicates quota exceeded
      if (aiResponse.includes('daily conversation limit') || aiResponse.includes('daily limit')) {
        setQuotaExceeded(true);
        setShowQuotaWarning(true);
      }
      
      const aiTurn: ConversationTurn = {
        speaker: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };
      setConversation([aiTurn]);
      
      const aiMessage: OpenAIMessage = {
        role: 'assistant',
        content: aiResponse
      };
      setConversationHistory([aiMessage]);
      
      await speakTextWithOpenAI(aiResponse);
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
    setDetailedFeedback(null);
    setQuotaExceeded(false);
    setShowQuotaWarning(false);
  };

  const handleGetFeedback = async () => {
    if (conversation.length === 0) {
      alert('Start a conversation first to get feedback!');
      return;
    }

    setFeedbackLoading(true);
    setShowFeedbackModal(true);

    try {
      const feedback = await OpenAIService.generateDetailedFeedback(
        conversation,
        selectedLanguage,
        selectedTopic
      );
      setDetailedFeedback(feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      
      if (error instanceof Error) {
        if (error.message === 'QUOTA_EXCEEDED') {
          setDetailedFeedback({
            overallPerformance: "We've reached our daily feedback limit, but your conversation practice was excellent!",
            strengths: [
              "You actively participated in the conversation",
              "Showed good engagement throughout the session",
              "Demonstrated willingness to practice and improve"
            ],
            grammaticalMistakes: [],
            vocabularySuggestions: [
              "Continue building your vocabulary through daily practice",
              "Try reading diverse content to expand your word knowledge"
            ],
            improvementTips: [
              "Keep practicing regularly - consistency is key",
              "Try again tomorrow for detailed AI feedback",
              "Focus on speaking with confidence"
            ],
            encouragement: "Your dedication to practice is commendable! Please try again tomorrow for detailed feedback."
          });
        } else if (error.message === 'RATE_LIMITED') {
          setDetailedFeedback({
            overallPerformance: "Great conversation! Please wait a moment before requesting feedback again.",
            strengths: [
              "You completed a full conversation session",
              "Showed persistence in practicing",
              "Engaged well with the AI mentor"
            ],
            grammaticalMistakes: [],
            vocabularySuggestions: [
              "Keep practicing to build fluency",
              "Try different conversation topics"
            ],
            improvementTips: [
              "Wait a few minutes and try feedback again",
              "Continue practicing conversations",
              "Focus on natural speech patterns"
            ],
            encouragement: "You're doing great! Please try requesting feedback again in a few minutes."
          });
        } else {
          setDetailedFeedback(null);
        }
      } else {
        setDetailedFeedback(null);
      }
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Show sign-in prompt if user is not signed in
  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-sage-200 dark:border-navy-700">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <MessageCircle className="w-16 h-16 text-sage-600 dark:text-sage-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-sage-900 dark:text-sage-100 mb-4">
                Ready to Practice?
              </h2>
              <p className="text-xl text-sage-600 dark:text-sage-400 mb-8">
                Sign in to start your conversation practice with our AI mentor and get personalized feedback!
              </p>
            </div>
            
            <div className="space-y-4">
              <SignInButton mode="modal">
                <Button className="w-64 h-16 text-xl bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white rounded-xl">
                  Sign In to Practice
                </Button>
              </SignInButton>
              
              <p className="text-sm text-sage-500 dark:text-sage-400">
                Join thousands of learners improving their communication skills
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Quota Warning Banner */}
      {showQuotaWarning && (
        <Card className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Daily Limit Reached</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  We've reached our daily conversation limit. The service will be available again tomorrow. 
                  Thank you for practicing with us today!
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Resets at midnight</span>
              </div>
              <Button
                onClick={() => setShowQuotaWarning(false)}
                variant="ghost"
                size="sm"
                className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  {quotaExceeded && (
                    <Badge className="ml-2 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Daily Limit Reached
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGetFeedback}
                    disabled={conversation.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Get Feedback
                  </Button>
                  <Button 
                    onClick={resetConversation} 
                    variant="outline" 
                    disabled={isProcessing}
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                  >
                    New Conversation
                  </Button>
                </div>
              </div>

              {/* Enhanced Listening Animation with Theme Colors */}
              <div className="text-center">
                <div className="relative flex items-center justify-center">
                  {/* Animated listening rings using sage theme */}
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
                  
                  {/* Main button with sage theme */}
                  <div 
                    className={`w-32 h-32 rounded-full transition-all duration-300 ${
                      quotaExceeded
                        ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 cursor-not-allowed'
                        : isListening 
                        ? 'bg-gradient-to-br from-sage-400 via-sage-500 to-sage-700 dark:from-sage-500 dark:via-sage-600 dark:to-sage-800' 
                        : isProcessing
                        ? 'bg-gradient-to-br from-sage-300 via-sage-400 to-sage-600'
                        : 'bg-gradient-to-br from-sage-500 via-sage-600 to-sage-800 hover:scale-105'
                    } shadow-xl flex items-center justify-center cursor-pointer`}
                    onClick={!isProcessing && !quotaExceeded ? toggleListening : quotaExceeded ? () => setShowQuotaWarning(true) : undefined}
                    style={{
                      transform: isListening ? `scale(${1.05 + audioLevel * 0.2})` : undefined,
                      boxShadow: isListening 
                        ? `0 0 ${30 + audioLevel * 40}px rgba(113, 163, 137, ${0.3 + audioLevel * 0.4})` 
                        : undefined
                    }}
                  >
                    {quotaExceeded ? (
                      <div className="flex flex-col items-center text-white">
                        <Clock className="w-8 h-8" />
                        <span className="text-xs mt-1 font-medium">Limit Reached</span>
                      </div>
                    ) : isProcessing ? (
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
                  {quotaExceeded && (
                    <div className="text-center">
                      <Badge className="bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 mb-3 px-4 py-2">
                        <Clock className="w-3 h-3 mr-1" />
                        Daily Limit Reached
                      </Badge>
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                        We've reached our daily conversation limit. Please try again tomorrow!
                      </p>
                    </div>
                  )}
                  
                  {!quotaExceeded && isProcessing && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="ml-2 text-sage-600 dark:text-sage-400 font-medium">AI mentor is thinking...</span>
                    </div>
                  )}
                  
                  {!quotaExceeded && isSpeaking && (
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
                  
                  {!quotaExceeded && isListening && (
                    <div className="text-center">
                      <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 mb-3 animate-pulse px-4 py-2">
                        🎤 Listening...
                      </Badge>
                      <p className="text-sage-600 dark:text-sage-400 text-sm font-medium">
                        Speak now in {LANGUAGES.find(l => l.code === selectedLanguage)?.name} - Your mentor will respond automatically
                      </p>
                      <div className="mt-2 bg-sage-100 dark:bg-sage-900/30 rounded-full h-2 w-32 mx-auto overflow-hidden">
                        <div 
                          className="bg-sage-500 h-full transition-all duration-100"
                          style={{ width: `${audioLevel * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {!quotaExceeded && !isListening && !isProcessing && !isSpeaking && (
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        feedback={detailedFeedback}
        isLoading={feedbackLoading}
      />
    </div>
  );
};
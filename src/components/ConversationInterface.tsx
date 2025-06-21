import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Settings, MessageCircle, Play, Pause } from 'lucide-react';
import { ConversationService, ConversationContext, ConversationResponse } from '@/services/conversationService';
import { ElevenLabsService, Voice } from '@/services/elevenLabsService';
import { AudioRecorder, AudioPlayer } from '@/utils/audioUtils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: ConversationResponse['feedback'];
}

export const ConversationInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedScenario, setSelectedScenario] = useState('casual');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('pNInz6obpgDQGcFmaJgB');
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  
  const messagesRef = useRef<HTMLDivElement>(null);
  const audioRecorder = useRef(new AudioRecorder());
  const audioPlayer = useRef(new AudioPlayer());

  const scenarios = ConversationService.getScenarios();
  const languages = ConversationService.getLanguages();

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const loadVoices = async () => {
    try {
      const voices = await ElevenLabsService.getVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Error loading voices:', error);
      setAvailableVoices(ElevenLabsService.getAvailableVoices());
    }
  };

  const startConversation = async () => {
    setConversationStarted(true);
    setMessages([]);
    
    const scenario = scenarios.find(s => s.value === selectedScenario);
    const language = languages.find(l => l.value === selectedLanguage);
    
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Hello! I'm ready to help you with ${scenario?.label.toLowerCase()} in ${language?.label}. Let's begin our conversation!`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Speak the welcome message
    try {
      const audioBlob = await ElevenLabsService.generateSpeech(welcomeMessage.content, selectedVoice);
      await speakAudio(audioBlob);
    } catch (error) {
      console.error('Error speaking welcome message:', error);
    }
  };

  const speakAudio = async (audioBlob: Blob) => {
    try {
      setIsSpeaking(true);
      await audioPlayer.current.playAudio(audioBlob);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    audioPlayer.current.stopAudio();
    setIsSpeaking(false);
  };

  const toggleListening = async () => {
    if (isListening) {
      try {
        setIsListening(false);
        setIsProcessing(true);
        
        const audioBlob = await audioRecorder.current.stopRecording();
        
        // Transcribe audio
        const transcription = await ConversationService.transcribeAudio(audioBlob);
        
        if (transcription && transcription.trim()) {
          const userMessage: Message = {
            role: 'user',
            content: transcription,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, userMessage]);
          
          // Process conversation
          const context: ConversationContext = {
            scenario: selectedScenario,
            language: selectedLanguage,
            conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
          };
          
          const response = await ConversationService.processConversation(transcription, context);
          
          const assistantMessage: Message = {
            role: 'assistant',
            content: response.text,
            timestamp: new Date(),
            feedback: response.feedback
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Speak the response
          try {
            const audioBlob = await ElevenLabsService.generateSpeech(response.text, selectedVoice);
            await speakAudio(audioBlob);
          } catch (error) {
            console.error('Error generating speech:', error);
          }
        }
      } catch (error) {
        console.error('Error processing audio:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      try {
        stopSpeaking();
        await audioRecorder.current.startRecording();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to start recording. Please check microphone permissions.');
      }
    }
  };

  const selectedScenarioData = scenarios.find(s => s.value === selectedScenario);
  const selectedLanguageData = languages.find(l => l.value === selectedLanguage);
  const selectedVoiceData = availableVoices.find(v => v.voice_id === selectedVoice);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card className="bg-white dark:bg-navy-800 border-sage-200 dark:border-navy-600">
        <CardHeader className="pb-4">
          <CardTitle className="text-sage-900 dark:text-sage-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl">AI Conversation Practice</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 text-xs sm:text-sm"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Settings
              </Button>
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                >
                  <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Settings Panel */}
          {showSettings && (
            <Card className="bg-sage-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-sage-800 dark:text-sage-200 mb-3">Conversation Settings</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-2 block">
                      Scenario
                    </label>
                    <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scenarios.map((scenario) => (
                          <SelectItem key={scenario.value} value={scenario.value}>
                            <div>
                              <div className="font-medium">{scenario.label}</div>
                              <div className="text-xs text-muted-foreground">{scenario.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-2 block">
                      Language
                    </label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            <div className="flex items-center gap-2">
                              <span>{language.flag}</span>
                              <span>{language.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-2 block">
                      Voice
                    </label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVoices.map((voice) => (
                          <SelectItem key={voice.voice_id} value={voice.voice_id}>
                            <div>
                              <div className="font-medium">{voice.name}</div>
                              {voice.description && (
                                <div className="text-xs text-muted-foreground">{voice.description}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Settings Display */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300">
              {selectedScenarioData?.label}
            </Badge>
            <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300">
              {selectedLanguageData?.flag} {selectedLanguageData?.label}
            </Badge>
            <Badge className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300">
              🎤 {selectedVoiceData?.name}
            </Badge>
          </div>

          {!conversationStarted ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-sage-800 dark:text-sage-200 mb-4">
                Ready to Begin Your Conversation?
              </h3>
              <p className="text-sage-600 dark:text-sage-400 mb-6">
                Click "Begin Journey" to start practicing with your AI conversation partner.
              </p>
              <Button
                onClick={startConversation}
                className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-8 py-3"
              >
                <Play className="w-4 h-4 mr-2" />
                Begin Journey
              </Button>
            </div>
          ) : (
            <>
              {/* Conversation Area */}
              <div 
                ref={messagesRef}
                className="h-60 sm:h-80 bg-sage-50 dark:bg-navy-700 rounded-lg p-3 sm:p-4 overflow-y-auto space-y-3 border border-sage-200 dark:border-navy-600"
              >
                {messages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-sage-600 dark:bg-sage-500 text-white'
                            : 'bg-white dark:bg-navy-800 text-sage-900 dark:text-sage-100 border border-sage-200 dark:border-navy-600'
                        }`}
                      >
                        <p className="text-xs sm:text-sm break-words">{message.content}</p>
                        <span className="text-xs opacity-70 block mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Feedback Display */}
                    {message.feedback && (
                      <div className="flex justify-start">
                        <Card className="max-w-[85%] sm:max-w-xs lg:max-w-md bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600">
                          <CardContent className="p-3">
                            <h5 className="font-medium text-sage-800 dark:text-sage-200 mb-2 text-xs">
                              💡 AI Feedback
                            </h5>
                            <div className="space-y-1 text-xs">
                              <div><strong>Grammar:</strong> {message.feedback.grammar}</div>
                              <div><strong>Fluency:</strong> {message.feedback.fluency}</div>
                              {message.feedback.suggestions && message.feedback.suggestions.length > 0 && (
                                <div>
                                  <strong>Tips:</strong>
                                  <ul className="list-disc list-inside ml-2 mt-1">
                                    {message.feedback.suggestions.map((tip, idx) => (
                                      <li key={idx}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                ))}
                
                {(isProcessing || isListening) && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-navy-800 border border-sage-200 dark:border-navy-600 rounded-lg px-3 sm:px-4 py-2 max-w-xs">
                      <div className="flex items-center gap-2">
                        {isListening ? (
                          <span className="text-red-500 text-xs sm:text-sm">🎤 Listening...</span>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <span className="text-xs sm:text-sm text-sage-600 dark:text-sage-400 ml-2">Processing...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Controls */}
              <div className="flex justify-center items-center gap-4">
                <Button
                  onClick={toggleListening}
                  disabled={isProcessing || isSpeaking}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700'
                  } text-white`}
                >
                  {isListening ? <MicOff className="w-6 h-6 sm:w-8 sm:h-8" /> : <Mic className="w-6 h-6 sm:w-8 sm:h-8" />}
                </Button>
                
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-sage-600 dark:text-sage-400">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">AI is speaking...</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-sage-600 dark:text-sage-400">
                  {isListening ? 'Listening... Speak now!' : 
                   isProcessing ? 'Processing your message...' :
                   isSpeaking ? 'AI is responding...' :
                   'Click the microphone to speak'}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
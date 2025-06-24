
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, MessageCircle, Volume2, VolumeX, User, Bot } from 'lucide-react';
import { GeminiService, GeminiMessage } from '@/services/geminiService';
import { SpeechService } from '@/services/speechService';
import { LanguageSelector } from '@/components/LanguageSelector';

export const ConversationPractice = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; message: string; timestamp: Date }>>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [preferMaleVoice, setPreferMaleVoice] = useState(false);
  const [feedback, setFeedback] = useState<{ grammar: string; pronunciation: string; fluency: string } | null>(null);
  const [isSpeechMode, setIsSpeechMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  const topics = [
    'Daily routine', 'Hobbies', 'Travel', 'Food', 'Work', 'Movies', 'Sports', 'Technology'
  ];

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        const speechRecognition = await SpeechService.startRecognition({ language: selectedLanguage });
        recognition.current = speechRecognition;

        recognition.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setCurrentMessage(transcript);
          setIsListening(false);
          
          // Auto-send message if in speech mode
          if (isSpeechMode) {
            handleSendMessage(transcript);
          }
        };

        recognition.current.onerror = (event: Event) => {
          console.error('Speech recognition error:', (event as any).error);
          setIsListening(false);
        };

        recognition.current.onend = () => {
          setIsListening(false);
        };
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    };

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      initializeSpeechRecognition();
    }

    // Cleanup function
    return () => {
      // Stop speech recognition
      if (recognition.current) {
        recognition.current.stop();
      }
      
      // Stop media stream
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
      }
      
      // Stop speech synthesis
      SpeechService.stopSpeech();
    };
  }, [selectedLanguage, isSpeechMode]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      await SpeechService.speakText(text, { 
        language: selectedLanguage, 
        preferMaleVoice: preferMaleVoice 
      });
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    SpeechService.stopSpeech();
    setIsSpeaking(false);
  };

  const startConversation = async (topic: string) => {
    setSelectedTopic(topic);
    setConversation([]);
    setConversationHistory([]);
    setIsLoading(true);

    try {
      const aiResponse = await GeminiService.startConversation(topic, selectedLanguage, topic);
      const aiMessage = { role: 'ai' as const, message: aiResponse, timestamp: new Date() };
      setConversation([aiMessage]);
      setConversationHistory([{ role: 'model', parts: [{ text: aiResponse }] }]);
      
      // Speak the AI response automatically
      if (isSpeechMode) {
        speakText(aiResponse);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
    
    setIsLoading(false);
  };

  const toggleListening = async () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
      // Stop media stream if active
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
        mediaStream.current = null;
      }
    } else {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStream.current = stream;
        
        // Stop any current speech before listening
        stopSpeaking();
        recognition.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Unable to access microphone. Please check permissions.');
      }
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || currentMessage;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, message: messageToSend, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    
    const newHistory = [...conversationHistory, { role: 'user' as const, parts: [{ text: messageToSend }] }];
    setConversationHistory(newHistory);
    
    setIsLoading(true);
    
    try {
      const result = await GeminiService.continueConversation(messageToSend, conversationHistory, selectedLanguage, selectedTopic);
      const aiMessage = { role: 'ai' as const, message: result.response, timestamp: new Date() };
      
      setConversation(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, { role: 'model', parts: [{ text: result.response }] }]);
      setFeedback(result.feedback || null);
      
      // Speak the AI response
      if (isSpeechMode) {
        speakText(result.response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    setCurrentMessage('');
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTopicChange = () => {
    // Clean up when changing topics
    if (recognition.current) {
      recognition.current.stop();
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    stopSpeaking();
    setIsListening(false);
    setSelectedTopic('');
    setConversation([]);
    setConversationHistory([]);
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-white dark:bg-navy-800 border-sage-200 dark:border-navy-600">
        <CardHeader>
          <CardTitle className="text-sage-900 dark:text-sage-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Conversation Practice
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setPreferMaleVoice(!preferMaleVoice)}
                  variant="outline"
                  size="sm"
                  className={`border-sage-300 dark:border-sage-600 ${
                    preferMaleVoice ? 'bg-blue-100 dark:bg-blue-800' : ''
                  }`}
                >
                  <User className="w-4 h-4 mr-1" />
                  {preferMaleVoice ? 'Male Voice' : 'Female Voice'}
                </Button>
                <Button
                  onClick={() => setIsSpeechMode(!isSpeechMode)}
                  variant="outline"
                  size="sm"
                  className={`border-sage-300 dark:border-sage-600 ${
                    isSpeechMode ? 'bg-sage-100 dark:bg-sage-800' : ''
                  }`}
                >
                  {isSpeechMode ? 'Speech Mode' : 'Text Mode'}
                </Button>
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <VolumeX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedTopic ? (
            <div>
              <h3 className="text-lg font-semibold text-sage-800 dark:text-sage-200 mb-3">
                Choose a conversation topic:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    onClick={() => startConversation(topic)}
                    variant="outline"
                    className="border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800"
                    disabled={isLoading}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300">
                  Topic: {selectedTopic} | Language: {selectedLanguage.toUpperCase()}
                </Badge>
                <Button
                  onClick={handleTopicChange}
                  variant="outline"
                  size="sm"
                  className="border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300"
                >
                  Change Topic
                </Button>
              </div>

              <div 
                ref={conversationRef}
                className="h-80 bg-sage-50 dark:bg-navy-700 rounded-lg p-4 overflow-y-auto space-y-3 border border-sage-200 dark:border-navy-600"
              >
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-sage-600 dark:bg-sage-500 text-white'
                          : 'bg-white dark:bg-navy-800 text-sage-900 dark:text-sage-100 border border-sage-200 dark:border-navy-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'user' ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Bot className="w-3 h-3" />
                        )}
                        <span className="text-xs font-medium">
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-navy-800 border border-sage-200 dark:border-navy-600 rounded-lg px-4 py-2 max-w-xs">
                      <div className="flex items-center gap-2">
                        <Bot className="w-3 h-3" />
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isSpeechMode ? (
                <div className="flex justify-center">
                  <Button
                    onClick={toggleListening}
                    disabled={isLoading || isSpeaking}
                    className={`w-20 h-20 rounded-full ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700'
                    } text-white`}
                  >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border-sage-300 dark:border-sage-600"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isLoading}
                    className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {feedback && (
                <Card className="bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sage-800 dark:text-sage-200 mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      AI Feedback
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Grammar:</strong> {feedback.grammar}</div>
                      <div><strong>Pronunciation:</strong> {feedback.pronunciation}</div>
                      <div><strong>Fluency:</strong> {feedback.fluency}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

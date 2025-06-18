import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { GeminiService, GeminiMessage } from '@/services/geminiService';

export const ConversationPractice = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; message: string; timestamp: Date }>>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [feedback, setFeedback] = useState<{ grammar: string; pronunciation: string; fluency: string } | null>(null);
  const [isSpeechMode, setIsSpeechMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  const topics = [
    'Daily routine', 'Hobbies', 'Travel', 'Food', 'Work', 'Movies', 'Sports', 'Technology'
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
        
        // Auto-send message if in speech mode
        if (isSpeechMode) {
          handleSendMessage(transcript);
        }
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [isSpeechMode]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
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

  const startConversation = async (topic: string) => {
    setSelectedTopic(topic);
    setConversation([]);
    setConversationHistory([]);
    setIsLoading(true);

    try {
      const aiResponse = await GeminiService.startConversation(topic);
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

  const toggleListening = () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      // Stop any current speech before listening
      stopSpeaking();
      recognition.current.start();
      setIsListening(true);
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
      const result = await GeminiService.continueConversation(messageToSend, conversationHistory);
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card className="bg-white dark:bg-navy-800 border-sage-200 dark:border-navy-600">
        <CardHeader className="pb-4">
          <CardTitle className="text-sage-900 dark:text-sage-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl">Conversation Practice</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setIsSpeechMode(!isSpeechMode)}
                variant="outline"
                size="sm"
                className={`border-sage-300 dark:border-sage-600 text-xs sm:text-sm ${
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
                  className="border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                >
                  <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedTopic ? (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-sage-800 dark:text-sage-200 mb-3">
                Choose a conversation topic:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    onClick={() => startConversation(topic)}
                    variant="outline"
                    className="border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 text-xs sm:text-sm p-2 sm:p-3 h-auto"
                    disabled={isLoading}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 text-xs sm:text-sm">
                  Topic: {selectedTopic}
                </Badge>
                <Button
                  onClick={() => {
                    setSelectedTopic('');
                    setConversation([]);
                    setConversationHistory([]);
                    setFeedback(null);
                    stopSpeaking();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 text-xs sm:text-sm"
                >
                  Change Topic
                </Button>
              </div>

              <div 
                ref={conversationRef}
                className="h-60 sm:h-80 bg-sage-50 dark:bg-navy-700 rounded-lg p-3 sm:p-4 overflow-y-auto space-y-3 border border-sage-200 dark:border-navy-600"
              >
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-sage-600 dark:bg-sage-500 text-white'
                          : 'bg-white dark:bg-navy-800 text-sage-900 dark:text-sage-100 border border-sage-200 dark:border-navy-600'
                      }`}
                    >
                      <p className="text-xs sm:text-sm break-words">{msg.message}</p>
                      <span className="text-xs opacity-70 block mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-navy-800 border border-sage-200 dark:border-navy-600 rounded-lg px-3 sm:px-4 py-2 max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700'
                    } text-white`}
                  >
                    {isListening ? <MicOff className="w-6 h-6 sm:w-8 sm:h-8" /> : <Mic className="w-6 h-6 sm:w-8 sm:h-8" />}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border-sage-300 dark:border-sage-600 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isLoading}
                    className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-3 sm:px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {feedback && (
                <Card className="bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600">
                  <CardContent className="p-3 sm:p-4">
                    <h4 className="font-semibold text-sage-800 dark:text-sage-200 mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      AI Feedback
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
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
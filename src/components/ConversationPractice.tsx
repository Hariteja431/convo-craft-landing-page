
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, MessageCircle, Volume2 } from 'lucide-react';
import { GeminiService, GeminiMessage } from '@/services/geminiService';

export const ConversationPractice = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; message: string; timestamp: Date }>>([]);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [feedback, setFeedback] = useState<{ grammar: string; pronunciation: string; fluency: string } | null>(null);
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  const topics = [
    'Daily routine', 'Hobbies', 'Travel', 'Food', 'Work', 'Movies', 'Sports', 'Technology'
  ];

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
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

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
      recognition.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, message: currentMessage, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    
    const newHistory = [...conversationHistory, { role: 'user' as const, parts: [{ text: currentMessage }] }];
    setConversationHistory(newHistory);
    
    setIsLoading(true);
    
    try {
      const result = await GeminiService.continueConversation(currentMessage, conversationHistory);
      const aiMessage = { role: 'ai' as const, message: result.response, timestamp: new Date() };
      
      setConversation(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, { role: 'model', parts: [{ text: result.response }] }]);
      setFeedback(result.feedback || null);
      
      // Speak the AI response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(result.response);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
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
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-white dark:bg-navy-800 border-sage-200 dark:border-navy-600">
        <CardHeader>
          <CardTitle className="text-sage-900 dark:text-sage-100 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Conversation Practice
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
                  Topic: {selectedTopic}
                </Badge>
                <Button
                  onClick={() => {
                    setSelectedTopic('');
                    setConversation([]);
                    setConversationHistory([]);
                    setFeedback(null);
                  }}
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
                        <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message or use voice..."
                  className="flex-1 border-sage-300 dark:border-sage-600"
                  disabled={isLoading}
                />
                <Button
                  onClick={toggleListening}
                  variant="outline"
                  size="icon"
                  className={`border-sage-300 dark:border-sage-600 ${
                    isListening ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'text-sage-700 dark:text-sage-300'
                  }`}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

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

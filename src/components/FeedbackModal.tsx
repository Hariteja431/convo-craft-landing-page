import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, CheckCircle, AlertCircle, Lightbulb, Target, Heart } from 'lucide-react';
import { DetailedFeedback, GrammaticalMistake } from '@/services/geminiService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: DetailedFeedback | null;
  isLoading: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
  isLoading
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const speakFeedback = () => {
    if (!feedback) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const feedbackText = `
      Overall Performance: ${feedback.overallPerformance}
      
      Your Strengths: ${feedback.strengths.join('. ')}
      
      ${feedback.grammaticalMistakes.length > 0 ? `Areas to improve: ${feedback.grammaticalMistakes.map(mistake => 
        typeof mistake === 'string' ? mistake : `${mistake.error} (Suggestion: ${mistake.correction})`
      ).join('. ')}` : ''}
      
      Vocabulary suggestions: ${feedback.vocabularySuggestions.join('. ')}
      
      Improvement tips: ${feedback.improvementTips.join('. ')}
      
      ${feedback.encouragement}
    `;

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(feedbackText);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentUtterance(null);
      };
      
      setCurrentUtterance(utterance);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    }
  };

  const renderGrammaticalMistake = (mistake: string | GrammaticalMistake, index: number) => {
    let displayText: string;
    
    if (typeof mistake === 'string') {
      displayText = mistake;
    } else if (mistake && typeof mistake === 'object' && 'error' in mistake && 'correction' in mistake) {
      displayText = `${mistake.error} (Suggestion: ${mistake.correction})`;
    } else {
      displayText = String(mistake);
    }

    return (
      <li key={index} className="flex items-start gap-2 text-orange-700 dark:text-orange-300">
        <Badge className="bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 text-xs px-2 py-1 mt-0.5">
          !
        </Badge>
        {displayText}
      </li>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-navy-800 border-sage-200 dark:border-navy-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sage-900 dark:text-sage-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-sage-600 dark:text-sage-400" />
            Your Conversation Feedback
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-sage-300 border-t-sage-600 rounded-full animate-spin"></div>
              <p className="text-sage-600 dark:text-sage-400 font-medium">Analyzing your conversation...</p>
            </div>
          </div>
        ) : feedback ? (
          <div className="space-y-6">
            {/* Listen to Feedback Button */}
            <div className="flex justify-center">
              <Button
                onClick={speakFeedback}
                className={`${
                  isSpeaking 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-sage-600 hover:bg-sage-700'
                } text-white px-6 py-3 text-lg`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-5 h-5 mr-2" />
                    Stop Feedback
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 mr-2" />
                    Listen to Feedback
                  </>
                )}
              </Button>
            </div>

            {/* Overall Performance */}
            <Card className="bg-sage-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600">
              <CardHeader>
                <CardTitle className="text-lg text-sage-900 dark:text-sage-100 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sage-700 dark:text-sage-300">{feedback.overallPerformance}</p>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-700 dark:text-green-300">
                      <Badge className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs px-2 py-1 mt-0.5">
                        ✓
                      </Badge>
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Grammatical Mistakes */}
            {feedback.grammaticalMistakes.length > 0 && (
              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-800 dark:text-orange-300 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.grammaticalMistakes.map((mistake, index) => 
                      renderGrammaticalMistake(mistake, index)
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Vocabulary Suggestions */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Vocabulary Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.vocabularySuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                      <Badge className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 mt-0.5">
                        💡
                      </Badge>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvement Tips */}
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Improvement Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.improvementTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-purple-700 dark:text-purple-300">
                      <Badge className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 mt-0.5">
                        🎯
                      </Badge>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Encouragement */}
            <Card className="bg-gradient-to-r from-sage-50 to-cream-50 dark:from-navy-700 dark:to-navy-600 border-sage-200 dark:border-navy-500">
              <CardHeader>
                <CardTitle className="text-lg text-sage-900 dark:text-sage-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Keep Going!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sage-700 dark:text-sage-300 font-medium">{feedback.encouragement}</p>
              </CardContent>
            </Card>

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onClose}
                className="bg-sage-600 hover:bg-sage-700 text-white px-8 py-3 text-lg"
              >
                Continue Practicing
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sage-600 dark:text-sage-400">No feedback available. Start a conversation to get personalized feedback!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
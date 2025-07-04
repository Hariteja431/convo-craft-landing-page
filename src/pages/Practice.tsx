import { HeroVoiceInteraction } from '@/components/HeroVoiceInteraction';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Practice = () => {
  // Cleanup microphone access when component unmounts
  useEffect(() => {
    return () => {
      // Stop any active media streams when leaving the practice page
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {
          // Ignore errors if no stream is active
        });
      
      // Stop any active speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // This will be handled by the ConversationPractice component cleanup
      }
      
      // Stop any active speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="w-full bg-white/95 dark:bg-navy-800/95 backdrop-blur-md border-b border-sage-200 dark:border-navy-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-sage-800 dark:text-sage-200">
                  ConvoCraft
                </span>
                <Badge className="ml-2 bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 border-sage-200 dark:border-sage-600 text-xs px-2 py-1">
                  Beta
                </Badge>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <ThemeToggle />
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" className="border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <HeroVoiceInteraction />
      </main>
    </div>
  );
};

export default Practice;
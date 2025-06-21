import { ConversationInterface } from '@/components/ConversationInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Practice = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="w-full bg-white/95 dark:bg-navy-800/95 backdrop-blur-md border-b border-sage-200 dark:border-navy-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-sage-800 dark:text-sage-200">
                  ConvoCraft
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-sage-700 dark:text-sage-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-sage-200 dark:border-navy-700 py-4">
              <Link to="/">
                <Button variant="ghost" className="w-full text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 justify-start">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-4 sm:py-8">
        <ConversationInterface />
      </main>
    </div>
  );
};

export default Practice;
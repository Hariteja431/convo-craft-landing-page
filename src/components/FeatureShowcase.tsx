import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mic, MessageCircle, Volume2, Brain, Globe, Users, Zap, Target } from 'lucide-react';

export const FeatureShowcase = () => {
  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Advanced Speech Recognition",
      description: "State-of-the-art AI converts your speech to text with remarkable accuracy across multiple languages and accents.",
      badge: "AI-Powered",
      color: "bg-blue-500"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Contextual AI Responses",
      description: "Intelligent conversation partner that adapts to your chosen scenario and maintains natural dialogue flow.",
      badge: "Smart AI",
      color: "bg-purple-500"
    },
    {
      icon: <Volume2 className="w-8 h-8" />,
      title: "Natural Voice Synthesis",
      description: "Premium ElevenLabs voices deliver human-like speech with emotional nuance and perfect pronunciation.",
      badge: "Premium Audio",
      color: "bg-green-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Language Support",
      description: "Practice conversations in 12+ languages with native-level AI responses and cultural context awareness.",
      badge: "Global",
      color: "bg-orange-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Scenario-Based Learning",
      description: "Specialized training for interviews, presentations, debates, and casual conversations with expert guidance.",
      badge: "Targeted",
      color: "bg-red-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-Time Feedback",
      description: "Instant analysis of grammar, fluency, and pronunciation with personalized improvement suggestions.",
      badge: "Instant",
      color: "bg-yellow-500"
    }
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <Badge className="mb-4 sm:mb-6 bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 hover:bg-sage-200 dark:hover:bg-sage-700 border-sage-200 dark:border-sage-600 text-xs sm:text-sm">
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Revolutionary Technology
          </Badge>
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">
            Experience the Future of Conversation Practice
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-sage-600 dark:text-sage-400 max-w-3xl mx-auto">
            Our cutting-edge AI technology combines advanced speech recognition, natural language processing, 
            and premium voice synthesis to create the most realistic conversation practice experience available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <Badge className="bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-sage-900 dark:text-sage-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sage-600 dark:text-sage-400 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12 lg:mt-16">
          <div className="bg-sage-50 dark:bg-navy-700 rounded-2xl p-6 sm:p-8 lg:p-12 border border-sage-200 dark:border-navy-600">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 dark:text-sage-100 mb-4">
              Ready to Transform Your Communication Skills?
            </h3>
            <p className="text-sage-600 dark:text-sage-400 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Join thousands of professionals, students, and language learners who have elevated their 
              speaking abilities with our AI-powered conversation practice platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-8 py-4 text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Begin Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 px-8 py-4 text-lg"
              >
                Experience Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
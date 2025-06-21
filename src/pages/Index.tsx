import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { MessageCircle, Users, Play, ArrowRight, CheckCircle, Star, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="w-full bg-white/95 dark:bg-navy-800/95 backdrop-blur-md border-b border-sage-200 dark:border-navy-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-sage-800 dark:text-sage-200">
                ConvoCraft
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Pricing</a>
              <a href="#contact" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Contact</a>
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
              <SignedIn>
                <Link to="/practice">
                  <Button className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white">
                    Start Practicing
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white">
                    Start Practicing
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
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
            <div className="lg:hidden border-t border-sage-200 dark:border-navy-700 py-4 space-y-4">
              <a href="#features" className="block text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Features</a>
              <a href="#how-it-works" className="block text-sage-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">How It Works</a>
              <a href="#pricing" className="block text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Pricing</a>
              <a href="#contact" className="block text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Contact</a>
              <div className="pt-4 border-t border-sage-200 dark:border-navy-700 space-y-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800">
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex justify-center">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                  </div>
                </SignedIn>
                <SignedIn>
                  <Link to="/practice">
                    <Button className="w-full bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white">
                      Start Practicing
                    </Button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white">
                      Start Practicing
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-4 sm:mb-6 bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 hover:bg-sage-200 dark:hover:bg-sage-700 border-sage-200 dark:border-sage-600 text-xs sm:text-sm">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              AI-Powered Conversation Practice
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-sage-900 dark:text-sage-100 mb-4 sm:mb-6 leading-tight">
              Master Any Conversation.{" "}
              <span className="text-sage-700 dark:text-sage-300">
                Practice with Confidence.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-sage-600 dark:text-sage-400 mb-6 sm:mb-8 leading-relaxed max-w-4xl mx-auto">
              Transform your speaking skills with our advanced AI conversation partner. From job interviews to public speaking, 
              practice real scenarios with intelligent feedback and natural voice interactions across multiple languages.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
              <SignedIn>
                <Link to="/practice">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 text-sm sm:text-base lg:text-lg"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Begin Journey
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 text-sm sm:text-base lg:text-lg"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Begin Journey
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/practice">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 text-sm sm:text-base lg:text-lg"
                  >
                    Experience Demo
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 text-sm sm:text-base lg:text-lg"
                  >
                    Experience Demo
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
              {[
                { number: "15+", label: "Voice Options" },
                { number: "12+", label: "Languages" },
                { number: "8", label: "Practice Scenarios" },
                { number: "Real-time", label: "AI Feedback" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-sage-900 dark:text-sage-100">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-sage-600 dark:text-sage-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-sage-50 dark:bg-navy-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">How ConvoCraft Works</h2>
            <p className="text-base sm:text-lg lg:text-xl text-sage-600 dark:text-sage-400">Three simple steps to conversation mastery</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              { 
                step: "1", 
                title: "Choose Your Scenario", 
                description: "Select from 8 specialized conversation scenarios including interviews, presentations, and casual chats",
                icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
              },
              { 
                step: "2", 
                title: "Speak Naturally", 
                description: "Have real conversations with our AI using advanced speech recognition and natural language processing",
                icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
              },
              { 
                step: "3", 
                title: "Receive Expert Feedback", 
                description: "Get instant analysis on grammar, fluency, pronunciation, and personalized improvement suggestions",
                icon: <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4 sm:mb-6 lg:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-sage-600 dark:bg-sage-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    {item.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-cream-100 dark:bg-navy-700 border-2 border-sage-300 dark:border-sage-600 rounded-full flex items-center justify-center text-sage-700 dark:text-sage-300 font-bold shadow-md text-xs sm:text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-sage-900 dark:text-sage-100 mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-sage-600 dark:text-sage-400 text-sm sm:text-base lg:text-lg leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">Choose Your Plan</h2>
            <p className="text-base sm:text-lg lg:text-xl text-sage-600 dark:text-sage-400">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Free Plan",
                price: "₹0/month",
                description: "Perfect for getting started",
                features: [
                  "1 AI conversation per day (5 min limit)",
                  "Basic feedback on fluency",
                  "3 conversation scenarios",
                  "Community support"
                ]
              },
              {
                name: "Pro Plan",
                price: "₹249/month",
                description: "For serious conversation practice",
                features: [
                  "Unlimited AI conversations",
                  "All 8 conversation scenarios",
                  "15+ premium voice options",
                  "Advanced feedback & analytics",
                  "Multi-language support",
                  "Priority support"
                ],
                popular: true
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-sage-400 dark:border-sage-500 shadow-xl scale-105' : 'border-sage-200 dark:border-navy-600'} bg-white dark:bg-navy-800`}>
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-sage-600 dark:bg-sage-500 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm">
                      🔷 Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-sage-900 dark:text-sage-100 mb-2">{plan.name}</h3>
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-2">{plan.price}</div>
                  <p className="text-sage-600 dark:text-sage-400 mb-4 sm:mb-6 text-xs sm:text-sm lg:text-base">{plan.description}</p>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sage-600 dark:text-sage-400 text-xs sm:text-sm lg:text-base">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-sage-500 dark:text-sage-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white' : 'bg-sage-100 dark:bg-navy-700 text-sage-800 dark:text-sage-200 hover:bg-sage-200 dark:hover:bg-navy-600'} text-sm sm:text-base`}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-8 sm:py-12 lg:py-16 xl:py-20 px-4 sm:px-6 lg:px-8 bg-sage-700 dark:bg-navy-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4">Ready to Transform Your Speaking Skills?</h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-sage-100 dark:text-sage-300 mb-4 sm:mb-6 lg:mb-8">
            Join thousands of users who have improved their conversation skills with ConvoCraft. 
            Start your journey today with our free plan.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/95 dark:bg-navy-700 border-sage-300 dark:border-navy-600 text-sage-900 dark:text-sage-100 placeholder-sage-500 dark:placeholder-sage-400 text-sm sm:text-base"
              required
            />
            <Button type="submit" className="bg-white dark:bg-sage-600 text-sage-700 dark:text-white hover:bg-sage-50 dark:hover:bg-sage-700 px-4 sm:px-6 lg:px-8 whitespace-nowrap text-sm sm:text-base">
              <ArrowRight className="w-4 h-4 ml-2" />
              Get Started
            </Button>
          </form>
          <p className="text-sage-200 dark:text-sage-400 text-xs sm:text-sm mt-3 sm:mt-4">
            No spam, unsubscribe anytime. Start practicing immediately.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-sage-900 dark:bg-navy-900 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">ConvoCraft</span>
              </div>
              <p className="text-sage-300 dark:text-sage-400 mb-4 sm:mb-6 max-w-md text-xs sm:text-sm lg:text-base">
                Revolutionizing conversation practice with advanced AI technology. 
                Master any speaking scenario with confidence and precision.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 text-xs sm:text-sm">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 text-xs sm:text-sm">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 text-xs sm:text-sm">
                  Facebook
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">Features</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">Pricing</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">API</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">About</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">Contact</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">Privacy</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-xs sm:text-sm lg:text-base">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sage-800 dark:border-navy-700 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-sage-400 dark:text-sage-500 text-xs sm:text-sm lg:text-base">© 2024 ConvoCraft. All rights reserved. Powered by advanced AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
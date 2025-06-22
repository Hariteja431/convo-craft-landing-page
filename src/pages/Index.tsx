import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MessageCircle, Users, Play, ArrowRight, CheckCircle, Star, MessageSquare, Sparkles, Mic } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

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
              <span className="text-2xl font-bold text-sage-800 dark:text-sage-200">
                ConvoCraft
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Pricing</a>
              <a href="#contact" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Contact</a>
              <ThemeToggle />
              <Button variant="outline" className="border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800">
                Sign In
              </Button>
              <Link to="/practice">
                <Button className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white">
                  Start Practicing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-6 bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 hover:bg-sage-200 dark:hover:bg-sage-700 border-sage-200 dark:border-sage-600">
              <Star className="w-4 h-4 mr-1" />
              AI-Powered Language Learning
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-sage-900 dark:text-sage-100 mb-6 leading-tight">
              Speak Fluently.{" "}
              <span className="text-sage-700 dark:text-sage-300">
                Practice Confidently.
              </span>
            </h1>
            <p className="text-xl text-sage-600 dark:text-sage-400 mb-8 leading-relaxed max-w-3xl mx-auto">
              Your sophisticated AI conversation partner. Master fluency with elegance, 
              refine your accent with precision, and build unshakeable confidence in any language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/practice">
                <Button 
                  size="lg" 
                  className="bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-8 py-6 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Begin Your Journey
                </Button>
              </Link>
              <Link to="/practice">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 px-8 py-6 text-lg"
                >
                  Experience Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">Distinguished Clientele</h2>
            <p className="text-xl text-sage-600 dark:text-sage-400">Elevating communication excellence across professions</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Scholars", description: "Master presentations with aristocratic poise", icon: "🎓", accent: "sage" },
              { title: "Executives", description: "Command boardrooms with eloquent confidence", icon: "💼", accent: "stone" },
              { title: "Diplomats", description: "Navigate international discourse effortlessly", icon: "✈️", accent: "navy" },
              { title: "Connoisseurs", description: "Appreciate linguistic nuance and cultural depth", icon: "🌍", accent: "cream" }
            ].map((item, index) => (
              <Card key={index} className="bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-sage-900 dark:text-sage-100 mb-3">{item.title}</h3>
                  <p className="text-sage-600 dark:text-sage-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-sage-50 dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">
              How ConvoCraft Works
            </h2>
            <p className="text-xl text-sage-600 dark:text-sage-400 max-w-3xl mx-auto">
              Master the art of conversation through our AI-powered practice sessions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white dark:bg-navy-700 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-sage-100 dark:bg-sage-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="text-2xl font-bold text-sage-900 dark:text-sage-100 mb-4">
                Choose Your Practice
              </h3>
              <p className="text-sage-600 dark:text-sage-400">
                Select from various conversation scenarios like job interviews, public speaking, or casual conversations to practice what matters most to you.
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-navy-700 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-sage-100 dark:bg-sage-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mic className="w-8 h-8 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="text-2xl font-bold text-sage-900 dark:text-sage-100 mb-4">
                Initiate Dialogue
              </h3>
              <p className="text-sage-600 dark:text-sage-400">
                Start speaking naturally with our AI mentor who adapts to your chosen scenario and provides real-time conversation practice.
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-navy-700 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-sage-100 dark:bg-sage-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="text-2xl font-bold text-sage-900 dark:text-sage-100 mb-4">
                Engage Eloquently
              </h3>
              <p className="text-sage-600 dark:text-sage-400">
                Receive instant feedback and engage in meaningful conversations that build your confidence and improve your communication skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">The ConvoCraft Advantage</h2>
            <p className="text-xl text-sage-600 dark:text-sage-400">Cultivating excellence in every conversation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Speak with Poise", description: "Practice in an environment of refined discretion", emoji: "🎭" },
              { title: "Cultivate Fluency", description: "Develop natural eloquence through deliberate practice", emoji: "📚" },
              { title: "Embrace Growth", description: "Transform feedback into polished communication", emoji: "🌱" },
              { title: "Timeless Access", description: "Excellence available at your distinguished convenience", emoji: "⌚" }
            ].map((benefit, index) => (
              <Card key={index} className="bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">{benefit.emoji}</div>
                  <h3 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-2">{benefit.title}</h3>
                  <p className="text-sage-600 dark:text-sage-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-sage-50 dark:bg-navy-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">Investment in Excellence</h2>
            <p className="text-xl text-sage-600 dark:text-sage-400 mb-8">Choose the membership that suits your distinguished needs</p>
            
            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-sage-100 dark:bg-navy-700 rounded-full p-1 flex items-center">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-white dark:bg-navy-600 text-sage-900 dark:text-sage-100 shadow-sm'
                      : 'text-sage-600 dark:text-sage-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === 'yearly'
                      ? 'bg-white dark:bg-navy-600 text-sage-900 dark:text-sage-100 shadow-sm'
                      : 'text-sage-600 dark:text-sage-400'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
            
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-8">
                Save 10% with yearly billing
              </p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-white dark:bg-navy-800 border-sage-200 dark:border-navy-600 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-sage-900 dark:text-sage-100 mb-2">Free Plan</h3>
                <p className="text-sage-600 dark:text-sage-400 mb-6">Perfect for getting started</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-sage-900 dark:text-sage-100">₹0</span>
                  <span className="text-sage-600 dark:text-sage-400">/year</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    '1 AI voice conversation per day (5 min limit)',
                    'Fluency & pronunciation feedback',
                    'Community support'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sage-600 dark:text-sage-400">
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-sage-100 dark:bg-navy-700 text-sage-800 dark:text-sage-200 hover:bg-sage-200 dark:hover:bg-navy-600 border border-sage-200 dark:border-navy-600">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative bg-white dark:bg-navy-800 border-2 border-purple-400 dark:border-purple-500 rounded-2xl shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm">
                  ⭐ Best for Fluency Practice
                </Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-sage-900 dark:text-sage-100 mb-2">Pro Plan</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-sage-900 dark:text-sage-100">
                    ₹{billingPeriod === 'monthly' ? '349' : '3141'}
                  </span>
                  <span className="text-sage-600 dark:text-sage-400">
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Up to 30 minutes of AI conversation per day',
                    'Save & replay past conversations',
                    'Text transcript after each session',
                    'Record own voice for mock replies',
                    'Faster AI response',
                    'Priority email support'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sage-600 dark:text-sage-400">
                      <CheckCircle className="w-5 h-5 text-purple-500 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-sage-700 dark:bg-navy-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Join the Distinguished Circle</h2>
          <p className="text-xl text-sage-100 dark:text-sage-300 mb-8">
            Be among the first to experience the future of refined language learning. 
            Receive your exclusive invitation when we launch.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your distinguished email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/95 dark:bg-navy-700 border-sage-300 dark:border-navy-600 text-sage-900 dark:text-sage-100 placeholder-sage-500 dark:placeholder-sage-400"
              required
            />
            <Button type="submit" className="bg-white dark:bg-sage-600 text-sage-700 dark:text-white hover:bg-sage-50 dark:hover:bg-sage-700 px-8">
              <ArrowRight className="w-4 h-4 ml-2" />
              Join Waitlist
            </Button>
          </form>
          <p className="text-sage-200 dark:text-sage-400 text-sm mt-4">
            Discretion assured. Unsubscribe with ease. Your privacy is our priority.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-sage-900 dark:bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">ConvoCraft</span>
              </div>
              <p className="text-sage-300 dark:text-sage-400 mb-6 max-w-md">
                Elevating the art of conversation through sophisticated AI technology. 
                Where eloquence meets innovation, and confidence becomes your greatest asset.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300">
                  Facebook
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Excellence</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">Features</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">Investment</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">API Access</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Heritage</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">About</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">Contact</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">Privacy Charter</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sage-800 dark:border-navy-700 mt-12 pt-8 text-center">
            <p className="text-sage-400 dark:text-sage-500">© 2024 ConvoCraft. All rights reserved. Crafted with distinction for the discerning linguist.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

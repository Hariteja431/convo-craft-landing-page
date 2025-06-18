import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroVoiceInteraction } from "@/components/HeroVoiceInteraction";
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
              <a href="#how-it-works" className="block text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">How It Works</a>
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
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge className="mb-4 sm:mb-6 bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 hover:bg-sage-200 dark:hover:bg-sage-700 border-sage-200 dark:border-sage-600 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                AI-Powered Language Learning
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-sage-900 dark:text-sage-100 mb-4 sm:mb-6 leading-tight">
                Speak Fluently.{" "}
                <span className="text-sage-700 dark:text-sage-300">
                  Practice Confidently.
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-sage-600 dark:text-sage-400 mb-6 sm:mb-8 leading-relaxed">
                Your sophisticated AI conversation partner. Master fluency with elegance, 
                refine your accent with precision, and build unshakeable confidence in any language.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <SignedIn>
                  <Link to="/practice">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Begin Your Journey
                    </Button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
                    >
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Begin Your Journey
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/practice">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
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
                      className="w-full sm:w-auto border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
                    >
                      Experience Demo
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
            <div className="relative order-1 lg:order-2 flex justify-center">
              <HeroVoiceInteraction />
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">Distinguished Clientele</h2>
            <p className="text-lg sm:text-xl text-sage-600 dark:text-sage-400">Elevating communication excellence across professions</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { title: "Scholars", description: "Master presentations with aristocratic poise", icon: "🎓", accent: "sage" },
              { title: "Executives", description: "Command boardrooms with eloquent confidence", icon: "💼", accent: "stone" },
              { title: "Diplomats", description: "Navigate international discourse effortlessly", icon: "✈️", accent: "navy" },
              { title: "Connoisseurs", description: "Appreciate linguistic nuance and cultural depth", icon: "🌍", accent: "cream" }
            ].map((item, index) => (
              <Card key={index} className="bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="text-3xl sm:text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-sage-900 dark:text-sage-100 mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-sage-600 dark:text-sage-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-sage-50 dark:bg-navy-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">The Refined Process</h2>
            <p className="text-lg sm:text-xl text-sage-600 dark:text-sage-400">Three elegant steps to linguistic mastery</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[
              { 
                step: "I", 
                title: "Initiate Dialogue", 
                description: "Begin with a touch of sophistication—select your conversation topic with discerning taste",
                icon: <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              },
              { 
                step: "II", 
                title: "Engage Eloquently", 
                description: "Converse naturally with our refined AI, practicing the art of articulate expression",
                icon: <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              },
              { 
                step: "III", 
                title: "Receive Refinement", 
                description: "Obtain sophisticated feedback on pronunciation, grammar, and cultural nuance",
                icon: <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sage-600 dark:bg-sage-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-cream-100 dark:bg-navy-700 border-2 border-sage-300 dark:border-sage-600 rounded-full flex items-center justify-center text-sage-700 dark:text-sage-300 font-bold shadow-md text-xs sm:text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-sage-900 dark:text-sage-100 mb-4">{item.title}</h3>
                <p className="text-sage-600 dark:text-sage-400 text-base sm:text-lg leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">The ConvoCraft Advantage</h2>
            <p className="text-lg sm:text-xl text-sage-600 dark:text-sage-400">Cultivating excellence in every conversation</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { title: "Speak with Poise", description: "Practice in an environment of refined discretion", emoji: "🎭" },
              { title: "Cultivate Fluency", description: "Develop natural eloquence through deliberate practice", emoji: "📚" },
              { title: "Embrace Growth", description: "Transform feedback into polished communication", emoji: "🌱" },
              { title: "Timeless Access", description: "Excellence available at your distinguished convenience", emoji: "⌚" }
            ].map((benefit, index) => (
              <Card key={index} className="bg-cream-50 dark:bg-navy-700 border-sage-200 dark:border-navy-600 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl mb-4">{benefit.emoji}</div>
                  <h3 className="text-base sm:text-lg font-semibold text-sage-900 dark:text-sage-100 mb-2">{benefit.title}</h3>
                  <p className="text-sage-600 dark:text-sage-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-sage-50 dark:bg-navy-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">Investment in Excellence</h2>
            <p className="text-lg sm:text-xl text-sage-600 dark:text-sage-400">Choose the membership that suits your distinguished needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Apprentice",
                price: "Complimentary",
                description: "Begin your journey with tasteful introduction",
                features: ["5 refined conversations monthly", "Essential feedback", "English mastery focus"]
              },
              {
                name: "Connoisseur",
                price: "$9.99/month",
                description: "For the discerning language enthusiast",
                features: ["Unlimited sophisticated dialogues", "Advanced AI mentorship", "Multilingual excellence", "Progress chronicles"],
                popular: true
              },
              {
                name: "Virtuoso",
                price: "$19.99/month",
                description: "The pinnacle of linguistic refinement",
                features: ["All Connoisseur privileges", "Personal coaching sessions", "Bespoke conversation scenarios", "Concierge support"]
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-sage-400 dark:border-sage-500 shadow-xl scale-105' : 'border-sage-200 dark:border-navy-600'} bg-white dark:bg-navy-800`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-sage-600 dark:bg-sage-500 text-white px-4 py-1 text-xs sm:text-sm">
                      Distinguished Choice
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-semibold text-sage-900 dark:text-sage-100 mb-2">{plan.name}</h3>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sage-900 dark:text-sage-100 mb-2">{plan.price}</div>
                  <p className="text-sage-600 dark:text-sage-400 mb-6 text-sm sm:text-base">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sage-600 dark:text-sage-400 text-sm sm:text-base">
                        <CheckCircle className="w-4 h-4 text-sage-500 dark:text-sage-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? 'bg-sage-700 dark:bg-sage-600 hover:bg-sage-800 dark:hover:bg-sage-700 text-white' : 'bg-sage-100 dark:bg-navy-700 text-sage-800 dark:text-sage-200 hover:bg-sage-200 dark:hover:bg-navy-600'}`}>
                    Begin Membership
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-sage-700 dark:bg-navy-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Join the Distinguished Circle</h2>
          <p className="text-lg sm:text-xl text-sage-100 dark:text-sage-300 mb-6 sm:mb-8">
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
            <Button type="submit" className="bg-white dark:bg-sage-600 text-sage-700 dark:text-white hover:bg-sage-50 dark:hover:bg-sage-700 px-6 sm:px-8 whitespace-nowrap">
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
      <footer id="contact" className="bg-sage-900 dark:bg-navy-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">ConvoCraft</span>
              </div>
              <p className="text-sage-300 dark:text-sage-400 mb-6 max-w-md text-sm sm:text-base">
                Elevating the art of conversation through sophisticated AI technology. 
                Where eloquence meets innovation, and confidence becomes your greatest asset.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 text-sm">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 text-sm">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 text-sm">
                  Facebook
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">Excellence</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">Features</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">Investment</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">API Access</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">Heritage</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">About</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">Contact</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">Privacy Charter</a></li>
                <li><a href="#" className="text-sage-400 dark:text-sage-500 hover:text-white dark:hover:text-sage-300 transition-colors text-sm sm:text-base">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-sage-800 dark:border-navy-700 mt-12 pt-8 text-center">
            <p className="text-sage-400 dark:text-sage-500 text-sm sm:text-base">© 2024 ConvoCraft. All rights reserved. Crafted with distinction for the discerning linguist.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
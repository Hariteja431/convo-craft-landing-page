import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mic, Globe, Clock, Users, Star, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="w-full bg-white/95 dark:bg-navy-800/95 backdrop-blur-md border-b border-sage-200 dark:border-navy-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-sage-800 dark:text-sage-200">
                ConvoCraft
              </span>
              <Badge className="ml-2 bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 border-sage-200 dark:border-sage-600 text-xs px-2 py-1">
                Beta
              </Badge>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#advantages" 
                className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('advantages')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Advantages
              </a>
              <a href="#how-it-works" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Pricing</a>
              <a href="#contact" className="text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
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
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-sage-900 dark:text-sage-100 mb-6 leading-tight">
            Master Any <span className="text-sage-600 dark:text-sage-400">Conversation</span>
          </h1>
          <p className="text-xl md:text-2xl text-sage-600 dark:text-sage-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            AI-powered conversation practice that adapts to your style, remembers your progress, and helps you excel in any professional setting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-sage-600 dark:bg-sage-500 hover:bg-sage-700 dark:hover:bg-sage-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Practicing Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/practice">
                <Button size="lg" className="bg-sage-600 dark:bg-sage-500 hover:bg-sage-700 dark:hover:bg-sage-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Continue Practicing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </SignedIn>
            <Button size="lg" variant="outline" className="border-2 border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800 px-8 py-4 text-lg font-semibold rounded-xl">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Distinguished Clientele Section */}
      <section id="advantages" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">The ConvoCraft Advantage</h2>
            <p className="text-xl text-sage-600 dark:text-sage-400">Cultivating excellence in every conversation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: MessageCircle, title: "Personalized Learning", desc: "AI adapts to your conversation style and remembers your progress" },
              { icon: Mic, title: "Real-time Feedback", desc: "Instant analysis of your communication effectiveness" },
              { icon: Globe, title: "Multi-language Support", desc: "Practice in over 10 languages with native-level AI" },
              { icon: Clock, title: "Flexible Scheduling", desc: "Practice anytime, anywhere with our 24/7 AI mentor" }
            ].map((feature, index) => (
              <Card key={index} className="border-sage-200 dark:border-sage-700 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-12 h-12 text-sage-600 dark:text-sage-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-2">{feature.title}</h3>
                  <p className="text-sage-600 dark:text-sage-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">How ConvoCraft Works</h2>
            <p className="text-xl text-sage-600 dark:text-sage-400">Three simple steps to conversation mastery</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Choose Your Scenario", desc: "Select from business meetings, interviews, presentations, or custom scenarios" },
              { step: "2", title: "Practice with AI", desc: "Engage in realistic conversations with our advanced AI that remembers your style" },
              { step: "3", title: "Get Insights", desc: "Receive detailed feedback and track your improvement over time" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-sage-600 dark:bg-sage-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-sage-900 dark:text-sage-100 mb-4">{item.title}</h3>
                <p className="text-sage-600 dark:text-sage-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-navy-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-sage-600 dark:text-sage-400">Flexible options for every learner</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: "Starter", 
                price: "$9", 
                period: "/month", 
                features: ["5 practice sessions/day", "Basic feedback", "3 languages", "Email support"],
                popular: false
              },
              { 
                name: "Professional", 
                price: "$19", 
                period: "/month", 
                features: ["Unlimited practice", "Advanced AI feedback", "All languages", "Priority support", "Progress analytics"],
                popular: true
              },
              { 
                name: "Enterprise", 
                price: "Custom", 
                period: "", 
                features: ["Team management", "Custom scenarios", "API access", "Dedicated support", "Usage analytics"],
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative border-2 ${plan.popular ? 'border-sage-600 dark:border-sage-400' : 'border-sage-200 dark:border-sage-700'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-sage-600 dark:bg-sage-500 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-sage-900 dark:text-sage-100 mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-sage-900 dark:text-sage-100">{plan.price}</span>
                    <span className="text-sage-600 dark:text-sage-400">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center">
                        <Check className="w-5 h-5 text-sage-600 dark:text-sage-400 mr-2" />
                        <span className="text-sage-700 dark:text-sage-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-sage-600 dark:bg-sage-500 hover:bg-sage-700 dark:hover:bg-sage-600 text-white' : 'border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800'}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        Get Started
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-sage-600 dark:bg-sage-500 hover:bg-sage-700 dark:hover:bg-sage-600 text-white' : 'border-sage-300 dark:border-sage-600 text-sage-700 dark:text-sage-300 hover:bg-sage-50 dark:hover:bg-sage-800'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  </SignedIn>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-sage-900 dark:text-sage-100 mb-4">Ready to Transform Your Communication?</h2>
          <p className="text-xl text-sage-600 dark:text-sage-400 mb-12">Join thousands of professionals who've elevated their conversation skills with ConvoCraft</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="max-w-sm border-sage-300 dark:border-sage-600 focus:border-sage-500 dark:focus:border-sage-400"
            />
            <Button className="bg-sage-600 dark:bg-sage-500 hover:bg-sage-700 dark:hover:bg-sage-600 text-white px-8">
              Get Started
            </Button>
          </div>
          <div className="flex justify-center items-center space-x-8 text-sage-600 dark:text-sage-400">
            <div className="flex items-center">
              <Star className="w-5 h-5 fill-current mr-1" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-1" />
              <span>10,000+ Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-navy-800 border-t border-sage-200 dark:border-navy-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-8 h-8 bg-sage-600 dark:bg-sage-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-sage-800 dark:text-sage-200">ConvoCraft</span>
          </div>
          <p className="text-sage-600 dark:text-sage-400 mb-6">Empowering professionals through intelligent conversation practice</p>
          <div className="flex justify-center space-x-6 text-sage-600 dark:text-sage-400">
            <a href="#" className="hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Privacy</a>
            <a href="#" className="hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Terms</a>
            <a href="#" className="hover:text-sage-900 dark:hover:text-sage-100 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

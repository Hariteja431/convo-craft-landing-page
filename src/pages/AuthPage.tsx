import { SignIn, SignUp } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AuthPage = () => {
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
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md bg-white dark:bg-navy-800 border-sage-200 dark:border-navy-600">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-sage-900 dark:text-sage-100 mb-2">
                Welcome to ConvoCraft
              </h1>
              <p className="text-sage-600 dark:text-sage-400">
                Sign in to start your language learning journey
              </p>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="flex justify-center">
                  <SignIn 
                    routing="hash"
                    signUpUrl="#signup"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-0 bg-transparent",
                      }
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="flex justify-center">
                  <SignUp 
                    routing="hash"
                    signInUrl="#signin"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-0 bg-transparent",
                      }
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
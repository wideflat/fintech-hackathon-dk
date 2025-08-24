import React from "react";
import { CheckCircle, Shield, Mic, Brain } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const LandingPage: React.FC = () => {
  const { setShowLanding } = useAppStore();

  const handleStartSmartCalling = () => {
    setShowLanding(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/mortgage-hero.jpg)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/95"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                <Brain className="w-4 h-4" />
                AI-Powered Call Assistant
              </span>
              
              <div className="mb-4">
                <h2 className="text-sm lg:text-base font-semibold tracking-wider text-gray-500 uppercase">
                  Mortgage Closer
                </h2>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Smart 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Companion</span>
                <br />During Lender Calls
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Get real-time AI assistance during your phone calls with loan officers. 
                Never miss important details, get instant guidance, and close better deals with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button 
                onClick={handleStartSmartCalling}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Mic className="w-5 h-5" />
                Start Demo
              </button>
            </div>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Real-time transcription</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Instant rate analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Smart negotiation tips</span>
              </div>
            </div>
          </div>

          {/* Right Column - AI Assistant Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/ai-call-assistant.jpg" 
                alt="AI assistant helping during mortgage call"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
            </div>
            
            {/* Floating AI Elements */}
            <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
              <Brain className="w-4 h-4 inline mr-2" />
              AI Active
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <Mic className="w-4 h-4 inline mr-2" />
              Listening...
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by mortgage professionals nationwide</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">End-to-End Encrypted</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span className="text-sm font-medium">Advanced AI Models</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              <span className="text-sm font-medium">Real-Time Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
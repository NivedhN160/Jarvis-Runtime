import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, Zap, TrendingUp, Users, Award, ArrowRight, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Glass Navigation */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>CreConnect</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button 
                data-testid="dashboard-btn"
                onClick={() => navigate(user.role === 'startup' ? '/startup' : '/creator')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full font-semibold btn-scale"
              >
                Dashboard
              </Button>
            ) : (
              <Button 
                data-testid="get-started-btn"
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full font-semibold btn-scale"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Tetris Grid */}
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Connect Brands with
              <span className="block text-blue-600 mt-2">Creative Talent</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-gray-600 mb-8 max-w-2xl">
              AI-powered platform bridging startups and content creators. Find perfect collaborations through intelligent matching based on reach, engagement, and content style.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                data-testid="hero-startup-btn"
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 rounded-full font-semibold text-lg btn-scale"
              >
                I'm a Brand <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                data-testid="hero-creator-btn"
                onClick={() => navigate('/auth')}
                className="border-2 border-primary/20 hover:border-primary/40 bg-white text-primary h-12 px-10 rounded-full font-semibold text-lg btn-scale"
              >
                I'm a Creator
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1758873269317-51888e824b28?crop=entropy&cs=srgb&fm=jpg&q=85" 
                alt="Creative collaboration"
                className="rounded-3xl shadow-xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>AI Powered</div>
                    <div className="text-sm text-gray-600">Smart Matching</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features - Bento Grid */}
      <div className="py-24 px-6 md:px-12 lg:px-24 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>How It Works</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">AI-driven insights to match the right talent with the right opportunity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-50 rounded-3xl p-8 card-hover" data-testid="feature-card-1">
            <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Define Your Need</h3>
            <p className="text-gray-600 leading-relaxed">Startups post collaboration requests with budget, platform, and content requirements.</p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 card-hover" data-testid="feature-card-2">
            <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>AI Analysis</h3>
            <p className="text-gray-600 leading-relaxed">Our AI evaluates creator profiles, engagement rates, and content style to find perfect matches.</p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8 card-hover" data-testid="feature-card-3">
            <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Award className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Connect & Collaborate</h3>
            <p className="text-gray-600 leading-relaxed">Review AI-suggested matches and connect with creators that align with your brand vision.</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 px-6 md:px-12 lg:px-24">
        <div className="bg-primary rounded-3xl p-12 md:p-16 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>95%</div>
              <div className="text-sm md:text-base text-white/80">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>500+</div>
              <div className="text-sm md:text-base text-white/80">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>1000+</div>
              <div className="text-sm md:text-base text-white/80">Collaborations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>98%</div>
              <div className="text-sm md:text-base text-white/80">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Ready to Find Your Perfect Match?</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">Join hundreds of brands and creators building successful collaborations</p>
          <Button 
            data-testid="cta-btn"
            onClick={() => navigate('/auth')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 rounded-full font-semibold text-lg btn-scale"
          >
            Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>CreConnect</span>
          </div>
          <div className="text-sm text-gray-600">© 2026 CreConnect. Connecting creativity with opportunity.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, Briefcase, Video } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('startup');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await axios.post(`${API}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        toast.success('Welcome back!');
        onLogin(response.data);
      } else {
        const response = await axios.post(`${API}/auth/signup`, {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: role
        });
        toast.success('Account created successfully!');
        onLogin(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>CreConnect</span>
          </div>
          <p className="text-gray-600">Connect with the right talent or opportunity</p>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white">
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  data-testid="login-submit-btn"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full font-semibold btn-scale mt-6"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      data-testid="role-startup-btn"
                      onClick={() => setRole('startup')}
                      className={`p-4 rounded-xl border-2 transition-all ${role === 'startup' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <Briefcase className={`h-6 w-6 mx-auto mb-2 ${role === 'startup' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="text-sm font-semibold">Startup/Brand</div>
                    </button>
                    <button
                      type="button"
                      data-testid="role-creator-btn"
                      onClick={() => setRole('creator')}
                      className={`p-4 rounded-xl border-2 transition-all ${role === 'creator' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <Video className={`h-6 w-6 mx-auto mb-2 ${role === 'creator' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <div className="text-sm font-semibold">Creator/Writer</div>
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    data-testid="signup-name-input"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    data-testid="signup-email-input"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    data-testid="signup-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  data-testid="signup-submit-btn"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full font-semibold btn-scale mt-6"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  const [serverStatus, setServerStatus] = useState('checking');

  React.useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await axios.get(`${API}/health`);
        if (res.data.status === 'ok') {
          setServerStatus('online');
        } else {
          setServerStatus('db_error');
          toast.error(`Database Error: ${res.data.database}. Please ensure MongoDB is running.`, { duration: 10000 });
        }
      } catch (err) {
        setServerStatus('offline');
        toast.error("Backend Server is offline. Please ensure the terminal is running.", { duration: 10000 });
      }
    };
    checkServer();
  }, []);

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
      console.error("Auth Error:", error);
      const message = error.response?.data?.detail
        || error.message
        || 'Authentication failed. Please check your connection.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center p-6">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>MAT-CHA.AI</span>
          </div>
          <p className="text-muted-foreground mb-4">Connect with the right talent or opportunity</p>

          <div className="flex justify-center mb-2">
            {serverStatus === 'online' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ● Systems Online
              </span>
            )}
            {serverStatus === 'db_error' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                ● Database Offline
              </span>
            )}
            {serverStatus === 'offline' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 animate-pulse">
                ● Server Offline
              </span>
            )}
          </div>
        </div>

        <Card className="p-8 shadow-xl border border-border bg-card text-card-foreground">
          <Tabs
            value={isLogin ? 'login' : 'signup'}
            onValueChange={(v) => !loading && setIsLogin(v === 'login')}
          >
            <TabsList className={`grid w-full grid-cols-2 mb-6 bg-muted text-muted-foreground p-1 rounded-lg ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              <TabsTrigger
                value="login"
                data-testid="login-tab"
                disabled={loading}
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                data-testid="signup-tab"
                disabled={loading}
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={loading}>
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
                      className="mt-1 bg-background border-input text-foreground focus:ring-ring"
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
                      className="mt-1 bg-background border-input text-foreground focus:ring-ring"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="login-submit-btn"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full font-semibold btn-scale mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" /> Signing in...
                      </span>
                    ) : 'Sign In'}
                  </Button>
                </fieldset>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={loading}>
                  <div className="mb-4">
                    <Label>I am a...</Label>
                    <div className={`grid grid-cols-2 gap-3 mt-2 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <button
                        type="button"
                        data-testid="role-startup-btn"
                        onClick={() => setRole('startup')}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${role === 'startup' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'}`}
                      >
                        <Briefcase className={`h-6 w-6 ${role === 'startup' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="text-sm font-semibold">Startup/Brand</div>
                      </button>
                      <button
                        type="button"
                        data-testid="role-creator-btn"
                        onClick={() => setRole('creator')}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${role === 'creator' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'}`}
                      >
                        <Video className={`h-6 w-6 ${role === 'creator' ? 'text-primary' : 'text-muted-foreground'}`} />
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
                      className="mt-1 bg-background border-input text-foreground focus:ring-ring"
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
                      className="mt-1 bg-background border-input text-foreground focus:ring-ring"
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
                      className="mt-1 bg-background border-input text-foreground focus:ring-ring"
                    />
                  </div>
                  <Button
                    type="submit"
                    data-testid="signup-submit-btn"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full font-semibold btn-scale mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" /> Creating account...
                      </span>
                    ) : 'Create Account'}
                  </Button>
                </fieldset>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            disabled={loading}
            className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
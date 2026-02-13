import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sparkles, Plus, Target, TrendingUp, Users, LogOut, Loader2, Zap, Instagram, Youtube, User, Palette, Trash2, Moon, Sun, BookOpen, MessageSquare, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../components/ui/dropdown-menu';
import { useTheme } from '../context/ThemeContext';
import ChatDialog from '../components/ChatDialog';
import MessagesTab from '../components/MessagesTab';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const StartupDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [collabs, setCollabs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showNewCollab, setShowNewCollab] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    target_platform: 'Both',
    content_type: 'Any'
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [externalSuggestions, setExternalSuggestions] = useState("");
  const [loadingExternal, setLoadingExternal] = useState(false);

  useEffect(() => {
    loadCollabs();
    loadAnalytics();
  }, []);

  const loadCollabs = async () => {
    try {
      const response = await axios.get(`${API}/collabs?startup_id=${user.id}`);
      setCollabs(response.data);
    } catch (error) {
      console.error("Failed to load collaborations:", error);
      toast.error(`Failed to load collaborations: ${error.response?.data?.detail || error.message}`);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics');
    }
  };

  const handleCreateCollab = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget) || 0
      };
      // Encode username to handle spaces/special characters that might break the URL
      const encodedName = encodeURIComponent(user.name);
      const url = `${API}/collabs?user_id=${user.id}&user_name=${encodedName}`;
      console.log("Creating collab request at:", url, "Body:", payload);

      await axios.post(url, payload);
      toast.success('Collaboration request created!');
      setShowNewCollab(false);
      setFormData({
        title: '',
        description: '',
        budget: '',
        target_platform: 'Both',
        content_type: 'Any'
      });
      loadCollabs();
    } catch (error) {
      console.error("Collab Creation Failed:", error);
      toast.error(`Failed to create collaboration: ${error.response?.data?.detail || error.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleGenerateMatches = async (collabId) => {
    setMatchLoading(true);
    setSelectedCollab(collabId);
    try {
      const response = await axios.post(`${API}/match/${collabId}`);
      setMatches(response.data.matches || []);
      if (response.data.matches && response.data.matches.length > 0) {
        toast.success(`Found ${response.data.matches.length} perfect matches!`);
      } else {
        toast.info(response.data.message || 'No matches found yet');
      }
    } catch (error) {
      toast.error('Failed to generate matches');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleDeleteCollab = async (collabId) => {
    if (!window.confirm("Are you sure you want to delete this collaboration request? This will also remove any related matches.")) return;
    try {
      await axios.delete(`${API}/collabs/${collabId}`);
      toast.success("Collaboration request deleted!");
      loadCollabs();
      // Clear matches if the deleted collab was the one currently selected
      if (selectedCollab === collabId) {
        setMatches([]);
        setSelectedCollab(null);
      }
    } catch (error) {
      console.error("Failed to delete collaboration:", error);
      toast.error(`Deletion failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ARE YOU SURE? This will delete your startup account and ALL requests permanently.")) return;
    try {
      await axios.delete(`${API}/users/${user.id}`);
      toast.success("Account deleted. Goodbye!");
      onLogout();
      navigate('/');
    } catch (e) { toast.error("Failed to delete account"); }
  }

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300" data-testid="startup-dashboard">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="px-4 md:px-12 lg:px-24 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>MAT-CHA.AI</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 p-0 overflow-hidden">
                  <span className="font-bold text-lg text-primary">{user.name.charAt(0).toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" /> Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" /> Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('reader')}>
                      <BookOpen className="mr-2 h-4 w-4" /> Reader
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleDeleteAccount}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24 py-12">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-12">


            {/* Analytics Cards */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card className="p-6 bg-card border-0 shadow-sm" data-testid="analytics-card-requests">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Requests</div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{analytics.total_requests}</div>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-card border-0 shadow-sm" data-testid="analytics-card-creators">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Active Creators</div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{analytics.total_creators}</div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-card border-0 shadow-sm" data-testid="analytics-card-matches">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Matches</div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{analytics.total_matches}</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-card border-0 shadow-sm" data-testid="analytics-card-score">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Avg Match Score</div>
                      <div className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{analytics.avg_match_score}%</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-xl">
                      <Zap className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Create New Collaboration Button */}
            <div className="mb-8">
              <Dialog open={showNewCollab} onOpenChange={setShowNewCollab}>
                <DialogTrigger asChild>
                  <Button
                    data-testid="create-collab-btn"
                    className="bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 rounded-full font-semibold btn-scale"
                  >
                    <Plus className="h-5 w-5 mr-2" /> New Collaboration Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Create Collaboration Request</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Fill in the details below to find the best creators for your campaign.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCollab} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        data-testid="collab-title-input"
                        placeholder="e.g., Tech Product Review for Launch"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="mt-1 bg-background border-input text-foreground focus:ring-ring"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="flex items-center justify-between">
                        Description
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            if (!formData.title) return toast.error("Enter a title first");
                            const promise = axios.post(`${API}/ai/generate-description`, {
                              title: formData.title,
                              platform: formData.target_platform,
                              content_type: formData.content_type
                            });

                            toast.promise(promise, {
                              loading: 'Generating with AI...',
                              success: (res) => {
                                setFormData(prev => ({ ...prev, description: res.data.description }));
                                return "Generated!";
                              },
                              error: 'Failed to generate'
                            });
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary h-6 px-2 text-xs"
                        >
                          <Sparkles className="h-3 w-3 mr-1" /> AI Generate
                        </Button>
                      </Label>
                      <Textarea
                        id="description"
                        data-testid="collab-description-input"
                        placeholder="Describe your collaboration needs, brand values, target audience..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        className="mt-1 min-h-[120px] bg-background border-input text-foreground focus:ring-ring"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input
                        id="budget"
                        data-testid="collab-budget-input"
                        type="number"
                        placeholder="50000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        required
                        className="mt-1 bg-background border-input text-foreground focus:ring-ring"
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform">Target Platform</Label>
                      <Select value={formData.target_platform} onValueChange={(v) => setFormData({ ...formData, target_platform: v })}>
                        <SelectTrigger data-testid="platform-select" className="mt-1 bg-background border-input text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="Both">Both Platforms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content-type">Content Type</Label>
                      <Select value={formData.content_type} onValueChange={(v) => setFormData({ ...formData, content_type: v })}>
                        <SelectTrigger data-testid="content-type-select" className="mt-1 bg-background border-input text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vlog">Vlog</SelectItem>
                          <SelectItem value="Short Film">Short Film</SelectItem>
                          <SelectItem value="Tutorial">Tutorial</SelectItem>
                          <SelectItem value="Any">Any Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      data-testid="submit-collab-btn"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full font-semibold btn-scale mt-6 disabled:opacity-70"
                      disabled={createLoading}
                    >
                      {createLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin" /> Creating...
                        </span>
                      ) : 'Create Request'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Collaboration Requests List */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Your Collaboration Requests</h2>
              {collabs.length === 0 ? (
                <Card className="p-12 text-center bg-card border-0 shadow-sm">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No collaboration requests yet. Create your first one to get started!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {collabs.map((collab) => (
                    <Card key={collab.id} className="p-6 bg-card border-0 shadow-sm card-hover" data-testid={`collab-card-${collab.id}`}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{collab.title}</h3>
                          <p className="text-muted-foreground mb-4">{collab.description}</p>
                          <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">₹{collab.budget.toLocaleString('en-IN')}</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{collab.target_platform}</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{collab.content_type}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            data-testid={`find-matches-btn-${collab.id}`}
                            onClick={() => handleGenerateMatches(collab.id)}
                            disabled={matchLoading && selectedCollab === collab.id}
                            className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 rounded-full font-semibold btn-scale whitespace-nowrap"
                          >
                            {matchLoading && selectedCollab === collab.id ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding...</>
                            ) : (
                              <><Sparkles className="h-4 w-4 mr-2" /> Find Matches</>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCollab(collab.id)}
                            className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full shrink-0"
                            title="Delete Request"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Matches Display */}
            {
              matches.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>AI-Suggested Matches</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {matches.map((match, idx) => (
                      <Card key={idx} className="p-6 bg-card border-2 border-blue-200 shadow-lg match-glow" data-testid={`match-card-${idx}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {Math.round(match.score)}% Match
                          </div>
                          <div className="bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                            #{idx + 1}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{match.creator.creator_name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{match.creator.bio}</p>
                        <div className="flex gap-2 mb-4">
                          {match.creator.platforms.includes('Instagram') && (
                            <div className="flex items-center gap-1 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                              <Instagram className="h-3 w-3" /> {(match.creator.instagram_followers / 1000).toFixed(1)}K
                            </div>
                          )}
                          {match.creator.platforms.includes('YouTube') && (
                            <div className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              <Youtube className="h-3 w-3" /> {(match.creator.youtube_subscribers / 1000).toFixed(1)}K
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="text-xs text-gray-500 mb-2 font-semibold">AI Analysis:</div>
                          <p className="text-sm text-gray-700">{match.analysis}</p>
                        </div>
                        <Button
                          onClick={() => {
                            setActiveMatch(match);
                            setShowChat(true);
                          }}
                          data-testid={`contact-creator-btn-${idx}`}
                          className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700 h-10 rounded-full font-semibold btn-scale"
                        >
                          Contact Creator
                        </Button>
                      </Card>
                    ))}
                  </div>

                  <ChatDialog
                    open={showChat}
                    onOpenChange={setShowChat}
                    matchId={activeMatch?.id}
                    currentUserId={user.id}
                    currentUserName={user.name}
                    isStartup={true}
                    initialMatchDetails={activeMatch}
                  />

                  <div className="mt-8 p-6 bg-secondary/20 rounded-xl border border-primary/10">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      External Market Suggestion (AI)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Looking for broader reach? Our AI suggests these established creators outside our platform might be a good fit for benchmarking.</p>

                    <Button
                      onClick={async () => {
                        const selected = collabs.find(c => c.id === selectedCollab);
                        if (!selected) return toast.error("Please select a collaboration first");

                        setLoadingExternal(true);
                        try {
                          const res = await axios.post(`${API}/ai/external-suggestions`, {
                            title: selected.title,
                            platform: selected.target_platform,
                            content_type: selected.content_type
                          });
                          setExternalSuggestions(res.data.suggestions);
                          toast.success("Suggestions loaded!");
                        } catch (error) {
                          toast.error("Failed to fetch suggestions");
                        } finally {
                          setLoadingExternal(false);
                        }
                      }}
                      disabled={loadingExternal}
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full"
                    >
                      {loadingExternal ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</>
                      ) : (
                        "Find Similar Global Creators"
                      )}
                    </Button>

                    {externalSuggestions && (
                      <Card className="mt-6 p-6 bg-background border-purple-200 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-4 text-purple-700 font-semibold border-b pb-2">
                          <TrendingUp className="h-4 w-4" />
                          Market Analysis Results
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                          {externalSuggestions}
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab user={user} isStartup={true} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StartupDashboard;

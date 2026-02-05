import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Sparkles, Plus, Target, TrendingUp, Users, LogOut, Loader2, Zap, Instagram, Youtube } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StartupDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [collabs, setCollabs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showNewCollab, setShowNewCollab] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    target_platform: 'Both',
    content_type: 'Any'
  });

  useEffect(() => {
    loadCollabs();
    loadAnalytics();
  }, []);

  const loadCollabs = async () => {
    try {
      const response = await axios.get(`${API}/collabs?startup_id=${user.id}`);
      setCollabs(response.data);
    } catch (error) {
      toast.error('Failed to load collaborations');
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
    try {
      await axios.post(`${API}/collabs?user_id=${user.id}&user_name=${user.name}`, formData);
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
      toast.error('Failed to create collaboration');
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

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="startup-dashboard">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>CreConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Welcome, <span className="font-semibold">{user.name}</span></div>
            <Button 
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="ghost"
              className="hover:bg-gray-100 rounded-full"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Startup Dashboard</h1>
          <p className="text-lg text-gray-600">Create collaboration requests and discover perfect creator matches</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 bg-white border-0 shadow-sm" data-testid="analytics-card-requests">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Requests</div>
                  <div className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{analytics.total_requests}</div>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-0 shadow-sm" data-testid="analytics-card-creators">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Active Creators</div>
                  <div className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{analytics.total_creators}</div>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-0 shadow-sm" data-testid="analytics-card-matches">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Matches</div>
                  <div className="text-3xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{analytics.total_matches}</div>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-0 shadow-sm" data-testid="analytics-card-score">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg Match Score</div>
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="collab-description-input"
                    placeholder="Describe your collaboration needs, brand values, target audience..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    data-testid="collab-budget-input"
                    type="number"
                    placeholder="5000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Target Platform</Label>
                  <Select value={formData.target_platform} onValueChange={(v) => setFormData({ ...formData, target_platform: v })}>
                    <SelectTrigger data-testid="platform-select" className="mt-1">
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
                    <SelectTrigger data-testid="content-type-select" className="mt-1">
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
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11 rounded-full font-semibold btn-scale mt-6"
                >
                  Create Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Collaboration Requests List */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Your Collaboration Requests</h2>
          {collabs.length === 0 ? (
            <Card className="p-12 text-center bg-white border-0 shadow-sm">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No collaboration requests yet. Create your first one to get started!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {collabs.map((collab) => (
                <Card key={collab.id} className="p-6 bg-white border-0 shadow-sm card-hover" data-testid={`collab-card-${collab.id}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{collab.title}</h3>
                      <p className="text-gray-600 mb-4">{collab.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">${collab.budget}</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{collab.target_platform}</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{collab.content_type}</span>
                      </div>
                    </div>
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
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Matches Display */}
        {matches.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>AI-Suggested Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matches.map((match, idx) => (
                <Card key={idx} className="p-6 bg-white border-2 border-blue-200 shadow-lg match-glow" data-testid={`match-card-${idx}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {Math.round(match.score)}% Match
                    </div>
                    <div className="bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold text-blue-700">
                      #{idx + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{match.creator.creator_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{match.creator.bio}</p>
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
                    data-testid={`contact-creator-btn-${idx}`}
                    className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700 h-10 rounded-full font-semibold btn-scale"
                  >
                    Contact Creator
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupDashboard;
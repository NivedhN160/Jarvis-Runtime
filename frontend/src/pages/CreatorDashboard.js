import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Video, Instagram, Youtube, TrendingUp, Eye, LogOut, Plus, Target } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreatorDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [collabRequests, setCollabRequests] = useState([]);
  const [formData, setFormData] = useState({
    bio: '',
    content_types: [],
    platforms: [],
    portfolio_links: ['']
  });

  useEffect(() => {
    loadProfile();
    loadCollabRequests();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API}/profiles?creator_id=${user.id}`);
      if (response.data && response.data.length > 0) {
        setProfile(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load profile');
    }
  };

  const loadCollabRequests = async () => {
    try {
      const response = await axios.get(`${API}/collabs`);
      setCollabRequests(response.data);
    } catch (error) {
      console.error('Failed to load collaboration requests');
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/profiles?user_id=${user.id}&user_name=${user.name}&user_email=${user.email}`,
        {
          ...formData,
          portfolio_links: formData.portfolio_links.filter(link => link.trim() !== '')
        }
      );
      toast.success('Profile created successfully!');
      setShowCreateProfile(false);
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    }
  };

  const toggleContentType = (type) => {
    setFormData(prev => ({
      ...prev,
      content_types: prev.content_types.includes(type)
        ? prev.content_types.filter(t => t !== type)
        : [...prev.content_types, type]
    }));
  };

  const togglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const addPortfolioLink = () => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: [...prev.portfolio_links, '']
    }));
  };

  const updatePortfolioLink = (index, value) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.map((link, i) => i === index ? value : link)
    }));
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="creator-dashboard">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
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
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Creator Dashboard</h1>
          <p className="text-lg text-gray-600">Showcase your portfolio and discover brand collaborations</p>
        </div>

        {/* Profile Section */}
        {!profile ? (
          <Card className="p-12 text-center bg-white border-0 shadow-sm mb-12">
            <Video className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Create Your Profile</h2>
            <p className="text-gray-600 mb-6">Set up your creator profile to start receiving collaboration opportunities</p>
            <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="create-profile-btn"
                  className="bg-purple-600 text-white hover:bg-purple-700 h-11 px-8 rounded-full font-semibold btn-scale"
                >
                  <Plus className="h-5 w-5 mr-2" /> Create Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>Create Creator Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProfile} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      data-testid="profile-bio-input"
                      placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      required
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label>Content Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['Vlog', 'Short Film', 'Tutorial', 'Review', 'Comedy'].map(type => (
                        <button
                          key={type}
                          type="button"
                          data-testid={`content-type-${type.toLowerCase()}`}
                          onClick={() => toggleContentType(type)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            formData.content_types.includes(type)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Platforms</Label>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        data-testid="platform-instagram"
                        onClick={() => togglePlatform('Instagram')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          formData.platforms.includes('Instagram')
                            ? 'border-pink-600 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Instagram className={`h-6 w-6 mx-auto mb-2 ${
                          formData.platforms.includes('Instagram') ? 'text-pink-600' : 'text-gray-400'
                        }`} />
                        <div className="text-sm font-semibold">Instagram</div>
                      </button>
                      <button
                        type="button"
                        data-testid="platform-youtube"
                        onClick={() => togglePlatform('YouTube')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          formData.platforms.includes('YouTube')
                            ? 'border-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Youtube className={`h-6 w-6 mx-auto mb-2 ${
                          formData.platforms.includes('YouTube') ? 'text-red-600' : 'text-gray-400'
                        }`} />
                        <div className="text-sm font-semibold">YouTube</div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Portfolio Links</Label>
                    {formData.portfolio_links.map((link, index) => (
                      <Input
                        key={index}
                        data-testid={`portfolio-link-${index}`}
                        type="url"
                        placeholder="https://..."
                        value={link}
                        onChange={(e) => updatePortfolioLink(index, e.target.value)}
                        className="mt-2"
                      />
                    ))}
                    <Button
                      type="button"
                      onClick={addPortfolioLink}
                      variant="outline"
                      className="mt-2 w-full"
                    >
                      + Add Another Link
                    </Button>
                  </div>
                  <Button 
                    type="submit" 
                    data-testid="submit-profile-btn"
                    className="w-full bg-purple-600 text-white hover:bg-purple-700 h-11 rounded-full font-semibold btn-scale mt-6"
                  >
                    Create Profile
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </Card>
        ) : (
          <Card className="p-8 bg-white border-0 shadow-sm mb-12" data-testid="creator-profile-card">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{profile.creator_name}</h2>
                <p className="text-gray-600 mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.content_types.map(type => (
                    <Badge key={type} variant="secondary" className="bg-purple-100 text-purple-700">{type}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {profile.platforms.includes('Instagram') && (
                    <div className="bg-pink-50 p-4 rounded-xl">
                      <Instagram className="h-5 w-5 text-pink-600 mb-2" />
                      <div className="text-sm text-gray-600">Instagram</div>
                      <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{(profile.instagram_followers / 1000).toFixed(1)}K</div>
                    </div>
                  )}
                  {profile.platforms.includes('YouTube') && (
                    <div className="bg-red-50 p-4 rounded-xl">
                      <Youtube className="h-5 w-5 text-red-600 mb-2" />
                      <div className="text-sm text-gray-600">YouTube</div>
                      <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{(profile.youtube_subscribers / 1000).toFixed(1)}K</div>
                    </div>
                  )}
                  <div className="bg-green-50 p-4 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
                    <div className="text-sm text-gray-600">Engagement</div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{profile.engagement_rate}%</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <Eye className="h-5 w-5 text-blue-600 mb-2" />
                    <div className="text-sm text-gray-600">Reach</div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>High</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Available Collaboration Requests */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Available Collaboration Opportunities</h2>
          {collabRequests.length === 0 ? (
            <Card className="p-12 text-center bg-white border-0 shadow-sm">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No collaboration requests available at the moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collabRequests.map((collab) => (
                <Card key={collab.id} className="p-6 bg-white border-0 shadow-sm card-hover" data-testid={`collab-opportunity-${collab.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold flex-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{collab.title}</h3>
                    <div className="text-lg font-bold text-green-600">${collab.budget}</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">by {collab.startup_name}</p>
                  <p className="text-gray-600 mb-4">{collab.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-purple-300 text-purple-700">{collab.target_platform}</Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">{collab.content_type}</Badge>
                  </div>
                  <Button 
                    data-testid={`apply-btn-${collab.id}`}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700 h-10 rounded-full font-semibold btn-scale"
                  >
                    Express Interest
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
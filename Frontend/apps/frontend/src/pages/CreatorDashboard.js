import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Video, Instagram, Youtube, TrendingUp, Eye, LogOut, Plus, Target } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreatorDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [collabRequests, setCollabRequests] = useState([]);
  const [bio, setBio] = useState('');
  const [contentTypes, setContentTypes] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);

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
    setCreateLoading(true);
    try {
      const filteredLinks = portfolioLinks.filter(link => link.trim() !== '');
      await axios.post(
        `${API}/profiles?user_id=${user.id}&user_name=${user.name}&user_email=${user.email}`,
        {
          bio,
          content_types: contentTypes,
          platforms: platforms,
          portfolio_links: filteredLinks
        }
      );
      toast.success('Profile created successfully!');
      setShowCreateProfile(false);
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const toggleContentType = (type) => {
    if (contentTypes.includes(type)) {
      setContentTypes(contentTypes.filter(t => t !== type));
    } else {
      setContentTypes([...contentTypes, type]);
    }
  };

  const togglePlatform = (plat) => {
    if (platforms.includes(plat)) {
      setPlatforms(platforms.filter(p => p !== plat));
    } else {
      setPlatforms([...platforms, plat]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300" data-testid="creator-dashboard">
      <nav className="glass-nav sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>MAT-CHA.AI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground">Welcome, <span className="font-semibold text-foreground">{user.name}</span></div>
            <Button
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="ghost"
              className="hover:bg-accent hover:text-accent-foreground rounded-full"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Creator Dashboard</h1>
          <p className="text-lg text-muted-foreground">Showcase your portfolio and discover brand collaborations</p>
        </div>

        {!profile ? (
          <Card className="p-12 text-center bg-card border-0 shadow-sm mb-12">
            <Video className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Create Your Profile</h2>
            <p className="text-muted-foreground mb-6">Set up your creator profile to start receiving collaboration opportunities</p>
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
                      placeholder="Tell brands about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      required
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label>Content Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        data-testid="content-type-vlog"
                        onClick={() => toggleContentType('Vlog')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${contentTypes.includes('Vlog') ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Vlog
                      </button>
                      <button
                        type="button"
                        data-testid="content-type-short film"
                        onClick={() => toggleContentType('Short Film')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${contentTypes.includes('Short Film') ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Short Film
                      </button>
                      <button
                        type="button"
                        data-testid="content-type-tutorial"
                        onClick={() => toggleContentType('Tutorial')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${contentTypes.includes('Tutorial') ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Tutorial
                      </button>
                      <button
                        type="button"
                        data-testid="content-type-review"
                        onClick={() => toggleContentType('Review')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${contentTypes.includes('Review') ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        data-testid="content-type-comedy"
                        onClick={() => toggleContentType('Comedy')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${contentTypes.includes('Comedy') ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Comedy
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Platforms</Label>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        data-testid="platform-instagram"
                        onClick={() => togglePlatform('Instagram')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${platforms.includes('Instagram')
                          ? 'border-pink-600 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <Instagram className={`h-6 w-6 mx-auto mb-2 ${platforms.includes('Instagram') ? 'text-pink-600' : 'text-gray-400'
                          }`} />
                        <div className="text-sm font-semibold">Instagram</div>
                      </button>
                      <button
                        type="button"
                        data-testid="platform-youtube"
                        onClick={() => togglePlatform('YouTube')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${platforms.includes('YouTube')
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <Youtube className={`h-6 w-6 mx-auto mb-2 ${platforms.includes('YouTube') ? 'text-red-600' : 'text-gray-400'
                          }`} />
                        <div className="text-sm font-semibold">YouTube</div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Portfolio Links</Label>
                    <Input
                      data-testid="portfolio-link-0"
                      type="url"
                      placeholder="https://..."
                      value={portfolioLinks[0] || ''}
                      onChange={(e) => {
                        const newLinks = [...portfolioLinks];
                        newLinks[0] = e.target.value;
                        setPortfolioLinks(newLinks);
                      }}
                      className="mt-2"
                    />
                    {portfolioLinks.length > 1 && (
                      <Input
                        data-testid="portfolio-link-1"
                        type="url"
                        placeholder="https://..."
                        value={portfolioLinks[1] || ''}
                        onChange={(e) => {
                          const newLinks = [...portfolioLinks];
                          newLinks[1] = e.target.value;
                          setPortfolioLinks(newLinks);
                        }}
                        className="mt-2"
                      />
                    )}
                    <Button
                      type="button"
                      onClick={() => setPortfolioLinks([...portfolioLinks, ''])}
                      variant="outline"
                      className="mt-2 w-full"
                    >
                      + Add Another Link
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    data-testid="submit-profile-btn"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full font-semibold btn-scale mt-6 disabled:opacity-70"
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" /> Creating...
                      </span>
                    ) : 'Create Profile'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </Card>
        ) : (
          <Card className="p-8 bg-card border-0 shadow-sm mb-12" data-testid="creator-profile-card">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{profile.creator_name}</h2>
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.content_types.length > 0 && profile.content_types[0] && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">{profile.content_types[0]}</Badge>
                  )}
                  {profile.content_types.length > 1 && profile.content_types[1] && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">{profile.content_types[1]}</Badge>
                  )}
                  {profile.content_types.length > 2 && profile.content_types[2] && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">{profile.content_types[2]}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {profile.platforms.includes('Instagram') && (
                    <div className="bg-pink-50 p-4 rounded-xl">
                      <Instagram className="h-5 w-5 text-pink-600 mb-2" />
                      <div className="text-sm text-muted-foreground">Instagram</div>
                      <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{(profile.instagram_followers / 1000).toFixed(1)}K</div>
                    </div>
                  )}
                  {profile.platforms.includes('YouTube') && (
                    <div className="bg-red-50 p-4 rounded-xl">
                      <Youtube className="h-5 w-5 text-red-600 mb-2" />
                      <div className="text-sm text-muted-foreground">YouTube</div>
                      <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{(profile.youtube_subscribers / 1000).toFixed(1)}K</div>
                    </div>
                  )}
                  <div className="bg-green-50 p-4 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
                    <div className="text-sm text-muted-foreground">Engagement</div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{profile.engagement_rate}%</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <Eye className="h-5 w-5 text-blue-600 mb-2" />
                    <div className="text-sm text-muted-foreground">Reach</div>
                    <div className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>High</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Available Collaboration Opportunities</h2>
          {collabRequests.length === 0 ? (
            <Card className="p-12 text-center bg-card border-0 shadow-sm">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">No collaboration requests available at the moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collabRequests.length > 0 && collabRequests[0] && (
                <Card className="p-6 bg-card border-0 shadow-sm card-hover" data-testid={`collab-opportunity-${collabRequests[0].id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold flex-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{collabRequests[0].title}</h3>
                    <div className="text-lg font-bold text-green-600">${collabRequests[0].budget}</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">by {collabRequests[0].startup_name}</p>
                  <p className="text-muted-foreground mb-4">{collabRequests[0].description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-purple-300 text-purple-700">{collabRequests[0].target_platform}</Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">{collabRequests[0].content_type}</Badge>
                  </div>
                  <Button
                    data-testid={`apply-btn-${collabRequests[0].id}`}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700 h-10 rounded-full font-semibold btn-scale"
                  >
                    Express Interest
                  </Button>
                </Card>
              )}
              {collabRequests.length > 1 && collabRequests[1] && (
                <Card className="p-6 bg-card border-0 shadow-sm card-hover" data-testid={`collab-opportunity-${collabRequests[1].id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold flex-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{collabRequests[1].title}</h3>
                    <div className="text-lg font-bold text-green-600">${collabRequests[1].budget}</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">by {collabRequests[1].startup_name}</p>
                  <p className="text-muted-foreground mb-4">{collabRequests[1].description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="border-purple-300 text-purple-700">{collabRequests[1].target_platform}</Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">{collabRequests[1].content_type}</Badge>
                  </div>
                  <Button
                    data-testid={`apply-btn-${collabRequests[1].id}`}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700 h-10 rounded-full font-semibold btn-scale"
                  >
                    Express Interest
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;

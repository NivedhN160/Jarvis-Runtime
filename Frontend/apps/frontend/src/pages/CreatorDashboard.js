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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../components/ui/dropdown-menu';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Video, Instagram, Youtube, TrendingUp, Eye, LogOut, Plus, Target, User, Settings, Palette, Trash2, Moon, Sun, BookOpen, MessageSquare } from 'lucide-react';
import ChatDialog from '../components/ChatDialog';
import MessagesTab from '../components/MessagesTab';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const CreatorDashboard = ({ user, onLogout, onOpenChat }) => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [collabRequests, setCollabRequests] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [bio, setBio] = useState('');
  const [contentTypes, setContentTypes] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [portfolioLinks, setPortfolioLinks] = useState(['']);
  const [createLoading, setCreateLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);

  // Post Form State
  const [postForm, setPostForm] = useState({ title: '', description: '', url: '', content_type: 'Video' });

  useEffect(() => {
    loadProfile();
    loadCollabRequests();
    loadMyContent();
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

  const loadMyContent = async () => {
    try {
      const res = await axios.get(`${API}/content?creator_id=${user.id}`);
      setMyPosts(res.data);
    } catch (e) { console.error("Failed to load content"); }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/content`, {
        ...postForm,
        creator_id: user.id,
        creator_name: user.name
      });
      toast.success("Content posted successfully!");
      setPostForm({ title: '', description: '', url: '', content_type: 'Video' });
      loadMyContent();
    } catch (e) {
      console.error("Post Error:", e);
      toast.error(`Failed to post content: ${e.response?.data?.detail || e.message}`);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axios.delete(`${API}/content/${id}`);
      toast.success("Post deleted");
      loadMyContent();
    } catch (e) { toast.error("Failed to delete"); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ARE YOU SURE? This will delete your profile, content, and matches permanently.")) return;
    try {
      await axios.delete(`${API}/users/${user.id}`);
      toast.success("Account deleted. Goodbye!");
      onLogout();
      navigate('/');
    } catch (e) { toast.error("Failed to delete account"); }
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const filteredLinks = portfolioLinks.filter(link => link.trim() !== '');
      const encodedName = encodeURIComponent(user.name);
      const encodedEmail = encodeURIComponent(user.email);
      await axios.post(
        `${API}/profiles?user_id=${user.id}&user_name=${encodedName}&user_email=${encodedEmail}`,
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

  const handleApply = async (collabId) => {
    try {
      const res = await axios.post(`${API}/interest/${collabId}?creator_id=${user.id}`);
      setActiveMatch(res.data);
      setShowChat(true);
      toast.success("Interest sent! Opening chat...");
    } catch (e) {
      console.error("Apply Error:", e);
      toast.error("Failed to express interest");
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
                <DropdownMenuItem onClick={() => {
                  // If profile exists, we can edit (reuse create dialog logic if adaptable, otherwise just show create for now or ideally open an edit mode)
                  // For MVP, if they have a profile, we let them edit by opening the same dialog but pre-filled logic would be needed. 
                  // Assuming create profile handles update or we just open it.
                  setShowCreateProfile(true);
                }}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
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

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Creator Dashboard</h1>
            <p className="text-lg text-muted-foreground">Showcase your portfolio and discover brand collaborations</p>
          </div>
          <div className="flex gap-3">

            <Card
              className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-primary/20 cursor-pointer hover:border-primary/50 transition-all group"
              onClick={onOpenChat}
              data-testid="open-writer-card"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-2 rounded-full group-hover:bg-primary/30 transition-colors">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">AI Content Studio</h3>
                  <p className="text-xs text-muted-foreground">Draft viral posts & scripts instantly</p>
                </div>
                <Button size="sm" className="ml-2 bg-primary text-primary-foreground">Open Writer</Button>
              </div>
            </Card>
          </div>
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

        <Tabs defaultValue="opportunities" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="opportunities" className="gap-2"><Target className="h-4 w-4" /> Opportunities</TabsTrigger>
            <TabsTrigger value="my-content" className="gap-2"><Video className="h-4 w-4" /> My Content & Posts</TabsTrigger>
            <TabsTrigger value="messages" className="gap-2"><MessageSquare className="h-4 w-4" /> Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <MessagesTab user={user} isStartup={false} />
          </TabsContent>

          <TabsContent value="opportunities">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>Available Collaboration Opportunities</h2>
            {collabRequests.length === 0 ? (
              <Card className="p-12 text-center bg-card border-0 shadow-sm">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">No collaboration requests available at the moment. Check back soon!</p>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const relevant = collabRequests.filter(c =>
                        profile.content_types.includes(c.content_type) || c.content_type === 'Any'
                      );
                      if (relevant.length === 0) toast.info("No specific matches found for your content types.");
                      else {
                        setCollabRequests(relevant);
                        toast.success(`Filtered ${relevant.length} relevant campaigns!`);
                      }
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> Show Matches For Me
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {collabRequests.map((collab) => (
                    <Card key={collab.id} className="p-6 bg-card border-0 shadow-sm card-hover" data-testid={`collab-opportunity-${collab.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold flex-1" style={{ fontFamily: 'Manrope, sans-serif' }}>{collab.title}</h3>
                        <div className="text-lg font-bold text-green-600">₹{collab.budget.toLocaleString('en-IN')}</div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">by {collab.startup_name}</p>
                      <p className="text-muted-foreground mb-4">{collab.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="border-purple-300 text-purple-700">{collab.target_platform}</Badge>
                        <Badge variant="outline" className="border-blue-300 text-blue-700">{collab.content_type}</Badge>
                      </div>
                      <Button
                        data-testid={`apply-btn-${collab.id}`}
                        onClick={() => handleApply(collab.id)}
                        className="w-full bg-purple-600 text-white hover:bg-purple-700 h-10 rounded-full font-semibold btn-scale active:scale-95 transition-transform"
                      >
                        Express Interest
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <ChatDialog
              open={showChat}
              onOpenChange={setShowChat}
              matchId={activeMatch?.id}
              currentUserId={user.id}
              currentUserName={user.name}
              isStartup={false}
              initialMatchDetails={activeMatch}
            />
          </TabsContent>

          <TabsContent value="my-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Post New Content</h3>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} required placeholder="e.g. My latest vlog" />
                    </div>
                    <div>
                      <Label>Content Type</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={postForm.content_type} onChange={e => setPostForm({ ...postForm, content_type: e.target.value })}>
                        <option>Video</option>
                        <option>Blog</option>
                        <option>Image</option>
                      </select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={postForm.description} onChange={e => setPostForm({ ...postForm, description: e.target.value })} required />
                    </div>
                    <div>
                      <Label>URL (Optional)</Label>
                      <Input value={postForm.url} onChange={e => setPostForm({ ...postForm, url: e.target.value })} placeholder="https://..." />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground">Post Content</Button>
                  </form>
                </Card>
              </div>
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-bold">My Recent Posts</h3>
                {myPosts.length === 0 && <p className="text-muted-foreground">You haven't posted any content yet.</p>}
                {myPosts.map(post => (
                  <Card key={post.id} className="p-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{post.title} <Badge variant="outline">{post.content_type}</Badge></h4>
                      <p className="text-sm text-muted-foreground mt-1">{post.description}</p>
                      {post.url && <a href={post.url} target="_blank" rel="noreferrer" className="text-blue-500 text-sm hover:underline block mt-2">{post.url}</a>}
                      <p className="text-xs text-gray-400 mt-2">Posted on {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" /></Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorDashboard;

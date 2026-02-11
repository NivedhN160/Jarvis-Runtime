
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageSquare, User, Building, ExternalLink, Calendar } from 'lucide-react';
import ChatDialog from './ChatDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const MessagesTab = ({ user, isStartup }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [activeMatch, setActiveMatch] = useState(null);

    const loadMatches = async () => {
        try {
            setLoading(true);
            const params = isStartup ? `startup_id=${user.id}` : `creator_id=${user.id}`;
            const response = await axios.get(`${API}/matches?${params}`);
            setMatches(response.data);
        } catch (error) {
            console.error("Failed to load matches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMatches();
    }, [user.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    My Conversations
                </h2>
                <Button variant="outline" onClick={loadMatches} size="sm">Refresh</Button>
            </div>

            {matches.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No active conversations yet</h3>
                    <p className="text-muted-foreground">
                        {isStartup
                            ? "Start finding creators for your requests to begin chatting!"
                            : "Express interest in collaboration requests to start negotiations!"}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((match) => (
                        <Card key={match.id} className="p-5 hover:shadow-lg transition-all border-l-4 border-l-primary hover:scale-[1.02] cursor-pointer" onClick={() => {
                            setActiveMatch(match);
                            setShowChat(true);
                        }}>
                            <div className="flex justify-between items-start mb-3">
                                <Badge variant={match.status === 'confirmed' ? 'success' : 'outline'} className={match.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(match.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg mb-1 line-clamp-1">{match.collab_title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                {isStartup ? <User className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                                <span>{isStartup ? match.creator_name : match.startup_name}</span>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                <div className="flex items-center gap-1">
                                    <div className={`h-2 w-2 rounded-full ${match.status === 'confirmed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                    <span className="text-xs font-semibold uppercase tracking-wider">
                                        {match.status === 'confirmed' ? 'Deal Ready' : 'In Progress'}
                                    </span>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10">
                                    Open Chat <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ChatDialog
                open={showChat}
                onOpenChange={setShowChat}
                matchId={activeMatch?.id}
                currentUserId={user.id}
                currentUserName={user.name}
                isStartup={isStartup}
                initialMatchDetails={activeMatch}
            />
        </div>
    );
};

export default MessagesTab;

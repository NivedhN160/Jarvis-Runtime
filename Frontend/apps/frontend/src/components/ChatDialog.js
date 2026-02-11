
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const ChatDialog = ({ open, onOpenChange, matchId, currentUserId, currentUserName, isStartup, initialMatchDetails }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [matchDetails, setMatchDetails] = useState(initialMatchDetails);
    const bottomRef = useRef(null);

    // Update matchDetails if props change (e.g. parent refreshes)
    useEffect(() => {
        if (initialMatchDetails) {
            setMatchDetails(initialMatchDetails);
        }
    }, [initialMatchDetails]);

    // Fetch messages & match details on open
    useEffect(() => {
        if (open && matchId) {
            loadMessages();
            loadMatchDetails();
            const interval = setInterval(loadMessages, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [open, matchId]);

    const loadMessages = async () => {
        try {
            const res = await axios.get(`${API}/chat/messages/${matchId}`);
            setMessages(res.data);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (e) {
            console.error("Failed to load chat", e);
        }
    };

    const loadMatchDetails = async () => {
        // We need an endpoint to get match details or pass it in.
        // For now, let's assume we can PUT to get the latest status if we update, 
        // but initially we might just rely on passed props if available, 
        // OR we just use the PUT endpoint to check current status effectively?
        // Actually, let's add a lightweight GET for match status or just use the updated match object returned from PUT.
        // For simplicity, we just use the PUT endpoint with empty update to get current state? No that updates.
        // We will fetch all matches and find this one, or add a specific GET /matches/{id} endpoint.
        // Let's just assume we can fetch it via the list for now or we just track our own actions.
        // Wait, I added GET /matches but it returns a list. 
        // Let's just assume for MVP the parent component passes the initial status, 
        // and we only update it when WE take action.
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(`${API}/chat/messages`, {
                match_id: matchId,
                sender_id: currentUserId,
                sender_name: currentUserName,
                content: newMessage
            });
            setNewMessage('');
            loadMessages();
        } catch (e) {
            toast.error("Failed to send message");
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const updateBody = isStartup ? { startup_agreed: true } : { creator_agreed: true };
            const res = await axios.put(`${API}/matches/${matchId}`, updateBody);

            setMatchDetails(res.data); // Update local state

            if (res.data.status === 'confirmed') {
                toast.success("Collaboration Confirmed! 🎉");
            } else {
                toast.success("Interest Confirm Sent! Waiting for partner.");
            }
        } catch (e) {
            toast.error("Failed to confirm");
        } finally {
            setLoading(false);
        }
    };

    const isConfirmed = matchDetails?.status === 'confirmed';
    const myAgreed = isStartup ? matchDetails?.startup_agreed : matchDetails?.creator_agreed;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Chat & Negotiate</span>
                        {isConfirmed && <span className="text-green-600 flex items-center text-sm"><CheckCircle2 className="h-4 w-4 mr-1" /> Deal Confirmed</span>}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10 rounded-md border border-border">
                    {messages.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm mt-10">Start the conversation...</p>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender_id === currentUserId ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${msg.sender_id === currentUserId
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-muted rounded-bl-none'
                                    }`}>
                                    <p>{msg.content}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="mt-4">
                    {/* Confirmation Status Area */}
                    {!isConfirmed && (
                        <div className="mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
                            <div className="text-xs text-blue-800">
                                {myAgreed ? "For the deal to be official, both parties must click Confirm." : "Ready to proceed? Click Confirm to signal your intent."}
                            </div>
                            {!myAgreed && (
                                <Button size="sm" onClick={handleConfirm} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
                                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Deal"}
                                </Button>
                            )}
                            {myAgreed && <span className="text-xs font-bold text-blue-600">You Confirmed ✓</span>}
                        </div>
                    )}

                    <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatDialog;

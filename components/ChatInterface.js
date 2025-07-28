// components/ChatInterface.js - FIXED VERSION for independent scrolling
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ChatMessage = ({ message, currentUser, onReply }) => {
    const isSender = currentUser && message.userId === currentUser.uid;
    const [showReplyButton, setShowReplyButton] = useState(false);
    
    const messageRowStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '4px',
        backgroundColor: showReplyButton ? '#f8fafc' : 'transparent',
        transition: 'background-color 0.2s ease',
        cursor: 'pointer'
    };

    const avatarStyle = {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        marginRight: '12px',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const fallbackAvatarStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: isSender ? '#3b82f6' : '#6b7280',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '50%'
    };

    const contentStyle = {
        flex: 1,
        minWidth: 0
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2px'
    };

    const nameStyle = {
        fontSize: '14px',
        fontWeight: '600',
        color: isSender ? '#3b82f6' : '#1f2937',
        marginRight: '8px'
    };

    const timeStyle = {
        fontSize: '12px',
        color: '#6b7280'
    };

    const textStyle = {
        fontSize: '14px',
        color: '#374151',
        lineHeight: '1.4',
        wordWrap: 'break-word'
    };

    const replyStyle = {
        fontSize: '12px',
        color: '#6b7280',
        marginBottom: '4px',
        fontStyle: 'italic'
    };

    const replyButtonStyle = {
        fontSize: '12px',
        color: '#3b82f6',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 6px',
        borderRadius: '4px',
        marginLeft: '8px',
        opacity: showReplyButton ? 1 : 0,
        transition: 'opacity 0.2s ease'
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div 
            style={messageRowStyle}
            onMouseEnter={() => setShowReplyButton(true)}
            onMouseLeave={() => setShowReplyButton(false)}
        >
            <div style={avatarStyle}>
                {message.userPhotoURL ? (
                    <Image 
                        src={message.userPhotoURL} 
                        alt="Profile" 
                        width={32} 
                        height={32} 
                        style={{ borderRadius: '50%' }}
                    />
                ) : (
                    <div style={fallbackAvatarStyle}>
                        {getInitials(message.userName || 'Anonymous')}
                    </div>
                )}
            </div>
            <div style={contentStyle}>
                <div style={headerStyle}>
                    <span style={nameStyle}>
                        {isSender ? 'You' : message.userName || 'Anonymous'}
                    </span>
                    <span style={timeStyle}>
                        {formatTime(message.createdAt)}
                    </span>
                    <button 
                        style={replyButtonStyle}
                        onClick={() => onReply(message)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        Reply
                    </button>
                </div>
                {message.replyTo && (
                    <div style={replyStyle}>
                        Replying to {message.replyTo.userName}: "{message.replyTo.text.slice(0, 50)}..."
                    </div>
                )}
                <div style={textStyle}>{message.text}</div>
            </div>
        </div>
    );
};

export default function ChatInterface({ channelId }) {
  const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new message - only scroll the chat container, not the whole page
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            });
        }
    }, [messages]);

    // 🔐 Setup Firestore listener safely
    useEffect(() => {
        if (!user || !user.uid || !channelId) {
            console.warn("⚠️ Skipping Firestore listener: missing user or channelId");
            return;
        }

        const q = query(
            collection(db, 'chats'),
            where('channel', '==', channelId),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(data);
            },
            (error) => {
                console.error(`❌ Firestore error in channel ${channelId}:`, error.message);
                setMessages([]);
            }
        );

        return () => unsubscribe();
    }, [channelId, user]);

    const handleReply = (message) => {
        setReplyingTo({
            id: message.id,
            userName: message.userName,
            text: message.text
        });
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!user || !user.uid) {
            alert("You must be logged in to send a message.");
            return;
        }

        const messageData = {
            text: newMessage,
            createdAt: serverTimestamp(),
            channel: channelId,
            userId: user.uid,
            userName: user.displayName || user.email,
            userPhotoURL: user.photoURL || null,
        };

        // Add reply information if replying to a message
        if (replyingTo) {
            messageData.replyTo = replyingTo;
        }

        try {
            await addDoc(collection(db, 'chats'), messageData);
            setNewMessage('');
            setReplyingTo(null);
        } catch (error) {
            console.error("CRITICAL: Error sending message to Firestore:", error);
            alert(`Could not send message. Error: ${error.message}`);
        }
    };

    if (!user) {
        return (
            <div style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px', 
                textAlign: 'center',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
            }}>
                <h3>Please log in to join the conversation.</h3>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            minHeight: 0 // CRITICAL: This allows flex child to shrink properly
        }}>
            {/* FIXED: Messages area with proper scrolling */}
            <div style={{ 
                flex: 1, 
                padding: '20px', 
                overflowY: 'auto',
                overflowX: 'hidden',
                minHeight: 0, // CRITICAL: This allows flex child to shrink properly
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                // Custom scrollbar styling
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e0 #f7fafc'
            }}>
                {messages.length > 0
                    ? messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} currentUser={user} onReply={handleReply} />
                    ))
                    : <p style={{ textAlign: 'center', color: '#6b7280' }}>Be the first to say something!</p>}
                <div ref={messagesEndRef} />
            </div>
            
            {/* FIXED: Input area that doesn't shrink */}
            <div style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
                flexShrink: 0 // CRITICAL: Prevent input area from shrinking
            }}>
                {replyingTo && (
                    <div style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        marginBottom: '12px',
                        fontSize: '14px',
                        color: '#1e40af'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                                Replying to <strong>{replyingTo.userName}</strong>: "{replyingTo.text.slice(0, 50)}..."
                            </span>
                            <button
                                onClick={cancelReply}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: '2px'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={replyingTo ? `Reply to ${replyingTo.userName}...` : `Message in #${channelId}...`}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db'
                        }}
                    />
                    <button type="submit" style={{
                        background: '#3b82f6',
                        color: 'white',
                        fontWeight: '600',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        {replyingTo ? 'Reply' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
}
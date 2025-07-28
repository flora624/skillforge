// pages/community.js
import { useState } from 'react';
import Navbar from '../components/Navbar';
import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

// Fetch all projects at build time to create the channel list
export async function getStaticProps() {
    const path = require('path');
    const fs = require('fs');
    const filePath = path.join(process.cwd(), 'data', 'projects.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(jsonData) || [];
    return { props: { projects } };
}

const ChannelButton = ({ channelId, channelName, activeChannel, onClick }) => {
    const isActive = channelId === activeChannel;
    const style = {
        width: '100%',
        padding: '12px 16px',
        background: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? 'white' : '#374151',
        border: 'none',
        borderRadius: '8px',
        textAlign: 'left',
        fontWeight: '500',
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'background 0.2s',
    };
    return <button style={style} onClick={() => onClick(channelId)}>{channelName}</button>;
};

export default function CommunityPage({ projects }) {
    const { user } = useAuth();
    const [selectedChannel, setSelectedChannel] = useState('general');

    const getChannelName = (channelId) => {
        if (channelId === 'general') return 'General Discussion';
        const projectId = channelId.replace('project_', '');
        const project = projects.find(p => p.id.toString() === projectId);
        return project ? project.title : 'Unknown Channel';
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <Navbar />
            <div style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 16px' }}>
                <header style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>Community Chat</h1>
                    <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Discuss projects, ask questions, and connect with other builders.</p>
                </header>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px', alignItems: 'flex-start' }}>
                    {/* Sidebar with Channels */}
                    <aside style={{ position: 'sticky', top: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>Channels</h3>
                            <ChannelButton
                                channelId="general"
                                channelName="# general"
                                activeChannel={selectedChannel}
                                onClick={setSelectedChannel}
                            />
                            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />
                            <h4 style={{ marginBottom: '12px', color: '#4b5563', fontSize: '0.875rem' }}>Project Discussions</h4>
                            {projects.map(project => (
                                <ChannelButton
                                    key={project.id}
                                    channelId={`project_${project.id}`}
                                    channelName={`# ${project.title.substring(0, 25)}...`}
                                    activeChannel={selectedChannel}
                                    onClick={setSelectedChannel}
                                />
                            ))}
                        </div>
                    </aside>

                    {/* Main Chat Interface */}
                    <main>
                        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>
                            Discussion: <span style={{ color: '#3b82f6' }}>{getChannelName(selectedChannel)}</span>
                        </h2>
                        <ChatInterface channelId={selectedChannel} />
                    </main>
                </div>
            </div>
        </div>
    );
}
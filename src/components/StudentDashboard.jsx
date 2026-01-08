import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'event', 'urgent' for navigation

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const unsubscribeData = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnnouncements(list);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeData();
        };
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Calculate Stats
    const totalUpdates = announcements.length;
    const upcomingEvents = announcements.filter(a => a.category === 'event').length;
    const urgentNotices = announcements.filter(a => a.category === 'urgent').length;

    // Filter Logic
    const displayedAnnouncements = announcements.filter(item => {
        if (filter === 'event') return item.category === 'event';
        if (filter === 'urgent') return item.category === 'urgent'; // (Optional if we had a tab)
        return true;
    });

    const getCategoryStyles = (cat) => {
        switch (cat) {
            case 'urgent': return { borderLeft: '4px solid #ef4444', icon: '🚨', tagClass: 'tag-urgent', label: 'Urgent' };
            case 'event': return { borderLeft: '4px solid #22c55e', icon: '📅', tagClass: 'tag-event', label: 'Event' };
            default: return { borderLeft: '1px solid rgba(0,0,0,0.04)', icon: '📢', tagClass: 'tag-general', label: 'By Admin' };
        }
    };

    return (
        <div className="dashboard-layout">
            {/* 🟢 SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    🎓 UNI-CONNECT
                </div>
                <nav>
                    <div className={`nav-item ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        📊 Dashboard
                    </div>
                    <div className="nav-item" onClick={() => { setFilter('all'); window.scrollTo({ top: 500, behavior: 'smooth' }); }}>
                        📢 Announcements
                    </div>
                    <div className={`nav-item ${filter === 'event' ? 'active' : ''}`} onClick={() => setFilter('event')}>
                        📅 Events
                    </div>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        🚪 Logout
                    </div>
                </div>
            </aside>

            {/* 🟢 MAIN CONTENT */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/')} className="btn-icon" style={{ background: 'transparent', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '8px', padding: '0.5rem', display: 'flex' }} title="Back to Home">
                            🏠
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="tag tag-general">Student</span>
                        <div style={{ width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1', fontWeight: 'bold' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Welcome back, {user?.email?.split('@')[0] || 'Student'}! 👋
                    </h1>
                    <p style={{ opacity: 0.9 }}>
                        Stay updated! You have access to the full history of <strong>{totalUpdates} announcements</strong> and updates below.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>📢</div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalUpdates}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Updates</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>📅</div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{upcomingEvents}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Upcoming Events</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>⚠️</div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{urgentNotices}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Urgent Notices</div>
                        </div>
                    </div>
                </div>

                {/* Announcements Feed */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{filter === 'event' ? 'Campus Events' : 'Latest Announcements'}</h3>
                    {filter !== 'all' && <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setFilter('all')}>View All</button>}
                </div>

                {displayedAnnouncements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: 'white', borderRadius: '12px' }}>
                        No {filter === 'event' ? 'events' : 'announcements'} found.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {displayedAnnouncements.map((item) => {
                            const styles = getCategoryStyles(item.category);
                            return (
                                <div key={item.id} className="modern-card" style={{ borderLeft: styles.borderLeft }}>
                                    <div className="modern-card-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontSize: '1.2rem' }}>{styles.icon}</span>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.title}</h3>
                                            </div>
                                        </div>
                                        <span className={`tag ${styles.tagClass}`}>{styles.label}</span>
                                    </div>
                                    <div className="modern-card-body" style={{ whiteSpace: 'pre-wrap' }}>
                                        {item.message}
                                    </div>
                                    <div className="modern-card-footer">
                                        <span>Posted by Admin</span>
                                        <span>{formatDate(item.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

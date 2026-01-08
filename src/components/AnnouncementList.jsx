import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function AnnouncementList({ isAdmin, onDelete, onEdit }) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Real-time listener
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
            });
            setAnnouncements(list);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching announcements:", err);
            setError("Failed to load announcements. " + err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getCategoryStyles = (cat) => {
        switch (cat) {
            case 'urgent': return { borderLeft: '4px solid #ef4444', icon: '🚨', tagClass: 'tag-urgent' };
            case 'event': return { borderLeft: '4px solid #22c55e', icon: '📅', tagClass: 'tag-event' };
            default: return { borderLeft: '1px solid rgba(0,0,0,0.04)', icon: '📢', tagClass: 'tag-general' };
        }
    };

    if (loading) return <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading announcements...</div>;

    if (announcements.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: 'white', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                <h3>No announcements yet</h3>
                <p>Check back later for updates.</p>
            </div>
        );
    }

    return (
        <div>
            {announcements.map((item) => {
                const styles = getCategoryStyles(item.category || 'normal');
                return (
                    <div key={item.id} className="modern-card" style={{ ...styles }}>
                        <div className="modern-card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>{styles.icon}</span>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>{item.title}</h3>
                            </div>

                            {/* Admin Actions or New Tag */}
                            {isAdmin ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => onEdit(item)}
                                        title="Edit"
                                        style={{
                                            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                                            background: '#eff6ff', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        title="Delete"
                                        style={{
                                            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                                            background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ) : (
                                <span className={`tag ${styles.tagClass}`}>
                                    {item.category === 'urgent' ? 'Urgent' : (item.category === 'event' ? 'Event' : 'New')}
                                </span>
                            )}
                        </div>
                        <div className="modern-card-body" style={{ whiteSpace: 'pre-wrap' }}>
                            {item.message}
                        </div>
                        <div className="modern-card-footer">
                            <span>Posted on {formatDate(item.createdAt)}</span>
                            {item.createdBy === 'admin' && <span className="tag tag-general" style={{ fontSize: '0.7rem', opacity: 0.8 }}>OFFICIAL</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

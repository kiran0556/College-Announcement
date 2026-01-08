import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import AnnouncementList from './AnnouncementList';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { sendAnnouncementEmail } from '../utils/emailService';

export default function AdminDashboard() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('normal'); // 'normal', 'urgent', 'event'
    const [isEditing, setIsEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // New success state

    // View State & Data
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'history', 'users'
    const [students, setStudents] = useState([]);

    const navigate = useNavigate();

    // Fetch Students when view changes
    useEffect(() => {
        if (currentView === 'users') {
            const fetchStudents = async () => {
                try {
                    // Fetching all students without sorting first to avoid index issues
                    const snapshot = await getDocs(collection(db, 'students'));
                    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Client-side sort
                    list.sort((a, b) => (b.joinedAt?.seconds || 0) - (a.joinedAt?.seconds || 0));
                    setStudents(list);
                } catch (err) {
                    console.error("Error fetching students:", err);
                }
            };
            fetchStudents();
        }
    }, [currentView]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        setSubmitting(true);
        // Optimistic Reset: Clear form visually first (or keep logic effectively fast)
        // We will keep standard await but remove the blocking alert.
        try {
            if (isEditing) {
                await updateDoc(doc(db, 'announcements', isEditing), {
                    title,
                    message,
                    category,
                    updatedAt: serverTimestamp()
                });
                setIsEditing(null);
            } else {
                await addDoc(collection(db, 'announcements'), {
                    title,
                    message,
                    category,
                    createdAt: serverTimestamp(),
                    createdBy: "admin"
                });
                // Trigger Email (non-blocking)
                sendAnnouncementEmail({ title, message, category }).catch(console.error);
            }

            // SUCCESS HANDLER
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000); // Hide after 3s

            // Reset Form
            setTitle('');
            setMessage('');
            setCategory('normal');
        } catch (err) {
            console.error("Error saving:", err);
            alert("Error saving announcement. Check console.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await deleteDoc(doc(db, 'announcements', id));
        } catch (err) {
            console.error("Error deleting:", err);
        }
    };

    const handleEdit = (item) => {
        setTitle(item.title);
        setMessage(item.message);
        setCategory(item.category || 'normal');
        setIsEditing(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    return (
        <div className="dashboard-layout">
            {/* 🔴 SIDEBAR (Admin) */}
            <aside className="sidebar">
                <div className="sidebar-logo" style={{ color: '#002147' }}>
                    🛡️ ADMIN PANEL
                </div>
                <nav>
                    <div className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
                        📢 Post Update
                    </div>
                    <div className={`nav-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>
                        📜 History
                    </div>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        🚪 Logout
                    </div>
                </div>
            </aside>

            {/* 🔴 MAIN CONTENT */}
            <main className="dashboard-main">
                {/* Header */}
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/')} className="btn-icon" style={{ background: 'transparent', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '8px', padding: '0.5rem', display: 'flex' }} title="Back to Home">
                            🏠
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {currentView === 'dashboard' ? 'New Announcement' : 'Announcement Log'}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="tag tag-urgent" style={{ background: '#fef2f2', color: '#dc2626' }}>Administrator</span>
                    </div>
                </header>

                {currentView === 'dashboard' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="welcome-banner" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '1.8rem' }}>Create New Update</h1>
                            <p>This will be instantly visible to all students.</p>
                        </div>
                        <div className="modern-card" style={{ padding: '2rem' }}>
                            <form onSubmit={handleSubmit}>
                                {/* Success Notification */}
                                {showSuccess && (
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        ✅ <strong>Success!</strong> Your announcement has been published.
                                    </div>
                                )}

                                {/* Category Selection */}
                                <div className="mb-4">
                                    <label className="mb-2" style={{ display: 'block', fontWeight: '500' }}>Type</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {['normal', 'urgent', 'event'].map(type => (
                                            <label key={type} style={{
                                                flex: 1, cursor: 'pointer', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', textTransform: 'capitalize',
                                                background: category === type ? (type === 'urgent' ? '#fef2f2' : type === 'event' ? '#f0fdf4' : '#eff6ff') : '#f9fafb',
                                                border: `1px solid ${category === type ? (type === 'urgent' ? '#ef4444' : type === 'event' ? '#22c55e' : '#3b82f6') : '#e5e7eb'}`,
                                                color: category === type ? (type === 'urgent' ? '#ef4444' : type === 'event' ? '#22c55e' : '#3b82f6') : '#6b7280',
                                                fontWeight: category === type ? '600' : '400'
                                            }}>
                                                <input type="radio" name="cat" value={type} checked={category === type} onChange={(e) => setCategory(e.target.value)} style={{ display: 'none' }} />
                                                {type === 'normal' ? 'ℹ️ Info' : type === 'urgent' ? '🚨 Urgent' : '📅 Event'}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="mb-2" style={{ display: 'block', fontWeight: '500' }}>Title</label>
                                    <input type="text" className="form-input" placeholder="Enter title..." value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>

                                <div className="mb-4">
                                    <label className="mb-2" style={{ display: 'block', fontWeight: '500' }}>Message</label>
                                    <textarea className="form-input" style={{ minHeight: '150px' }} placeholder="Write your announcement..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                                    {submitting ? 'Publishing...' : '🚀 Publish Announcement'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {currentView === 'history' && (
                    <div>
                        <AnnouncementList isAdmin={true} onDelete={handleDelete} onEdit={(item) => {
                            // Switch to dashboard and pre-fill
                            setCurrentView('dashboard');
                            setTitle(item.title);
                            setMessage(item.message);
                            setCategory(item.category || 'normal');
                            setIsEditing(item.id);
                        }} />
                    </div>
                )}
            </main>
        </div>
    );
}

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

export default function StudentLogin() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegistering) {
                // Simple Registration
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Store email in 'students' collection for notifications
                await setDoc(doc(db, 'students', userCredential.user.uid), {
                    email: email,
                    role: 'student',
                    joinedAt: new Date()
                });
            } else {
                // Login
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/student/dashboard');
        } catch (err) {
            console.error(err);
            let msg = err.message.replace('Firebase: ', '');
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/admin-restricted-operation' || err.message.includes('configuration-not-found')) {
                msg = "⚠️ SETUP REQUIRED: Go to Firebase Console > Authentication > Enable Email/Password Provider.";
            } else if (err.code === 'auth/email-already-in-use') {
                msg = "Email already registered. Please login instead.";
            } else if (err.code === 'auth/invalid-credential') {
                msg = "Invalid email or password.";
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <div className="text-center mb-4">
                    <div className="role-icon" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', fontSize: '2rem' }}>🎓</div>
                    <h2>{isRegistering ? 'Student Registration' : 'Student Login'}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isRegistering ? 'Create an account to get updates' : 'Welcome back, student'}
                    </p>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Please wait...' : (isRegistering ? 'Register & Enter' : 'Login')}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isRegistering ? 'Already have an account? Login' : 'New student? Register here'}
                    </button>
                </div>

                <div className="text-center mt-4" style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}

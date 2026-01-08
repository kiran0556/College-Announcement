import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 🔒 RESTRICTED ADMIN LIST
    const ALLOWED_EMAILS = ['admin@college.edu', 'principal@college.edu', 'test@admin.com', '23am1a0556@svrec.ac.in'];

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!ALLOWED_EMAILS.includes(user.email)) {
                await auth.signOut();
                throw new Error("⛔ Access Denied: You are not an authorized administrator.");
            }

            navigate('/admin');
        } catch (err) {
            console.error(err);
            let msg = "Failed to login. Please check your credentials.";

            if (err.message.includes('Access Denied')) {
                msg = err.message;
            } else if (err.code === 'auth/configuration-not-found' || err.message.includes('configuration-not-found')) {
                msg = "⚠️ SETUP REQUIRED: Enable 'Email/Password' in Firebase Console -> Authentication.";
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <div className="announcement-card">
                <h2 className="card-title text-center mb-4" style={{ fontSize: '1.5rem' }}>Admin Access</h2>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

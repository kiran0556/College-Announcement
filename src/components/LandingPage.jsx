import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LandingPage() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                maxWidth: '600px',
                width: '100%',
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s ease-out'
            }}>
                {/* Logo / Icon */}
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>

                {/* Simple Headlines */}
                <h1 style={{
                    fontSize: '2.5rem',
                    color: '#0f172a',
                    marginBottom: '1rem',
                    fontWeight: '800',
                    letterSpacing: '-0.5px'
                }}>
                    UniConnect
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#64748b',
                    marginBottom: '3rem',
                    lineHeight: '1.6'
                }}>
                    The official campus portal. <br />
                    Check for latest announcements, events, and urgent updates instantly.
                </p>

                {/* Buttons Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
                    <button
                        onClick={() => navigate('/student/login')}
                        className="hover-scale"
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'white',
                            background: '#2563eb',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        Student Login
                    </button>

                    <button
                        onClick={() => navigate('/admin/login')}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#475569',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                        onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                        Admin Access
                    </button>
                </div>

                <div style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    © 2026 College Announcement Portal
                </div>
            </div>
        </div>
    );
}

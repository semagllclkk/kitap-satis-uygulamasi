'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavbarProps {
    cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        setUserName(localStorage.getItem('userName') || '');
        setUserRole(localStorage.getItem('userRole') || '');
    }, []);

    function handleLogout() {
        localStorage.clear();
        router.push('/');
    }

    return (
        <nav
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(15, 10, 15, 0.9)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid #3d1f4a',
                padding: '0 1.5rem',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            {/* Logo */}
            <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                onClick={() => router.push(userRole === 'admin' ? '/admin' : '/dashboard')}
            >
                <span style={{ fontSize: '1.4rem' }}>📚</span>
                <span
                    style={{
                        fontWeight: '800',
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #f472b6, #db2777)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Kitabevi
                </span>
                {userRole === 'admin' && (
                    <span className="badge badge-pink" style={{ marginLeft: '0.25rem' }}>
                        Admin
                    </span>
                )}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Cart button (only for customers) */}
                {userRole === 'customer' && (
                    <button
                        className="btn-ghost"
                        onClick={() => router.push('/cart')}
                        style={{ position: 'relative', padding: '0.5rem 0.9rem' }}
                    >
                        🛒
                        {cartCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#db2777',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {cartCount}
                            </span>
                        )}
                    </button>
                )}

                {/* Username */}
                <span style={{ fontSize: '0.85rem', color: '#c084fc' }}>
                    👤 {userName}
                </span>

                <button className="btn-ghost" onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                    Çıkış
                </button>
            </div>
        </nav>
    );
}

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';

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
        <nav className={styles.navbar}>
            {/* Logo */}
            <div className={styles.logo} onClick={() => router.push(userRole === 'admin' ? '/admin' : '/dashboard')}>
                <span className={styles.logoIcon}>📚</span>
                <span className={styles.logoText}>
                    Kitabevi
                </span>
                {userRole === 'admin' && (
                    <span className={`badge badge-pink ${styles.adminBadge}`}>
                        Admin
                    </span>
                )}
            </div>

            {/* Right side */}
            <div className={styles.rightSection}>
                {/* Cart button (only for customers) */}
                {userRole === 'customer' && (
                    <button
                        className={`btn-ghost ${styles.cartButton}`}
                        onClick={() => router.push('/cart')}
                    >
                        🛒
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                )}

                {/* Username */}
                <span className={styles.userName}>
                    👤 {userName}
                </span>

                <button className={`btn-ghost ${styles.logoutButton}`} onClick={handleLogout}>
                    Çıkış
                </button>
            </div>
        </nav>
    );
}

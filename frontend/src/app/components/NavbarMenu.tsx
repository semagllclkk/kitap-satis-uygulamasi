import styles from './Navbar.module.css';

interface NavbarMenuProps {
    userName: string;
    userRole: string;
    cartCount: number;
    router: any;
}

export function NavbarMenu({ userName, userRole, cartCount, router }: NavbarMenuProps) {
    function handleLogout() {
        localStorage.clear();
        router.push('/');
    }

    return (
        <div className={styles.navMenu}>
            {userRole === 'customer' && (
                <button className="btn-ghost" onClick={() => router.push('/cart')} style={{ position: 'relative', padding: '0.5rem 0.9rem' }}>
                    🛒
                    {cartCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#db2777', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
                </button>
            )}
            <span className={styles.navUserInfo}>👤 {userName}</span>
            <button className="btn-ghost" onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>Çıkış</button>
        </div>
    );
}

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
                <button className={`btn-ghost`} onClick={() => router.push('/cart')} style={{ position: 'relative', padding: '0.5rem 0.9rem' }}>
                    🛒
                    {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                </button>
            )}
            <span style={{ fontSize: '0.85rem', color: '#c084fc' }}>👤 {userName}</span>
            <button className={`btn-ghost`} onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>Çıkış</button>
        </div>
    );
}

import styles from './Navbar.module.css';

interface NavbarLogoProps {
    userRole: string;
    router: any;
}

export function NavbarLogo({ userRole, router }: NavbarLogoProps) {
    return (
        <div className={styles.logoContainer} onClick={() => router.push(userRole === 'admin' ? '/admin' : '/dashboard')}>
            <span className={styles.logoIcon}>📚</span>
            <span className={styles.logoText}>Kitabevi</span>
            {userRole === 'admin' && <span className={`badge badge-pink ${styles.adminBadge}`}>Admin</span>}
        </div>
    );
}

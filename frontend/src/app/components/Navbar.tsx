'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import { NavbarLogo } from './NavbarLogo';
import { NavbarMenu } from './NavbarMenu';

/**
 * Tek sorumluluk: Navbar layout ve composition
 * Logo rendering → NavbarLogo
 * Menu rendering → NavbarMenu
 * Styling → CSS module
 */
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

    return (
        <nav className={styles.navbar}>
            <NavbarLogo userRole={userRole} router={router} />
            <NavbarMenu 
                userName={userName} 
                userRole={userRole} 
                cartCount={cartCount} 
                router={router} 
            />
        </nav>
    );
}

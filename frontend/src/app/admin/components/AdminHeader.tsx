'use client';

import { useRouter } from 'next/navigation';
import { Package, User, Users } from 'lucide-react';
import styles from '../admin.module.css';

export const AdminHeader = () => {
    const router = useRouter();

    return (
        <div className={styles.header}>
            <div>
                <h1 className={styles.headerTitle}>
                    <Package size={22} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Envanter Paneli
                </h1>
                <p className={styles.headerSubtitle}>
                    {new Date().getFullYear()} yılı yönetim ekranı
                </p>
            </div>
            <div className={styles.headerActions}>
                <button className="btn-ghost" onClick={() => router.push('/admin/authors')}>
                    <User size={15} /> Yazar Yönetimi
                </button>
                <button className="btn-ghost" onClick={() => router.push('/admin/users')}>
                    <Users size={15} /> Kullanıcı Yönetimi
                </button>
            </div>
        </div>
    );
};

'use client';

import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export const AdminHeader = () => {
    const router = useRouter();

    return (
        <div className={styles.header}>
            <div>
                <h1 className={styles.headerTitle}>📦 Envanter Paneli</h1>
                <p className={styles.headerSubtitle}>
                    {new Date().getFullYear()} yılı yönetim ekranı
                </p>
            </div>
            <div className={styles.headerActions}>
                <button className="btn-ghost" onClick={() => router.push('/admin/authors')}>
                    👤 Yazar Yönetimi
                </button>
                <button className="btn-ghost" onClick={() => router.push('/admin/users')}>
                    👥 Kullanıcı Yönetimi
                </button>
            </div>
        </div>
    );
};

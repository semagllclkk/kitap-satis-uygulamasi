'use client';

import styles from '../admin.module.css';

interface AdminFooterProps {
    resetting: boolean;
    seeding: boolean;
    onResetClick: () => void;
    onSeedRandomClick: () => void;
}

export const AdminFooter = ({ resetting, seeding, onResetClick, onSeedRandomClick }: AdminFooterProps) => (
    <footer className={styles.footer}>
        <span className={styles.footerText}>Kitabevi Dashboard</span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
                onClick={onSeedRandomClick}
                disabled={seeding}
                className={styles.resetFooterButton}
                style={{ borderColor: '#a78bfa80', color: '#a78bfa' }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#a78bfa15';
                    e.currentTarget.style.borderColor = '#a78bfa';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#a78bfa80';
                }}
            >
                {seeding ? 'Ekleniyor...' : '📊 Random Veri Ekle'}
            </button>
            <button
                onClick={onResetClick}
                disabled={resetting}
                className={styles.resetFooterButton}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8717115';
                    e.currentTarget.style.borderColor = '#f87171';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#f8717180';
                }}
            >
                {resetting ? 'Sıfırlanıyor...' : '⚠️ Admin Reset'}
            </button>
        </div>
    </footer>
);

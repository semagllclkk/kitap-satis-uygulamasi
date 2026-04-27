'use client';

import styles from '../admin.module.css';

interface AdminFooterProps {
    resetting: boolean;
    onResetClick: () => void;
}

export const AdminFooter = ({ resetting, onResetClick }: AdminFooterProps) => (
    <footer className={styles.footer}>
        <span className={styles.footerText}>Kitabevi Dashboard</span>
        <button
            onClick={onResetClick}
            disabled={resetting}
            style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                background: 'transparent',
                color: '#f87171',
                border: '1px solid #f8717180',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.85rem',
                opacity: resetting ? 0.6 : 1,
                transition: 'all 0.2s',
            }}
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
    </footer>
);

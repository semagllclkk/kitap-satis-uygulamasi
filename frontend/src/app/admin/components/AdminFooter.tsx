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
    </footer>
);

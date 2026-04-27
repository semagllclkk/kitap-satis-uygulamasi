'use client';

import styles from '../admin.module.css';

interface ToastProps {
    message: string;
}

export const Toast = ({ message }: ToastProps) => {
    if (!message) return null;
    return <div className={styles.toast}>{message}</div>;
};

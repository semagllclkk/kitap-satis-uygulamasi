'use client';

import styles from '../admin.module.css';

interface ResetModalProps {
    show: boolean;
    resetting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ResetModal = ({ show, resetting, onConfirm, onCancel }: ResetModalProps) => {
    if (!show) return null;

    return (
        <div className={styles.modal}>
            <div className={`glass ${styles.resetModal}`}>
                <p className={styles.resetWarning}>⚠️</p>
                <h2 className={styles.resetTitle}>Sistemi Sıfırla</h2>
                <p className={styles.resetText}>
                    Tüm test verileri silinip, sistem temiz demo verileriyle baştan kurulacaktır. Onaylıyor musunuz?
                </p>
                <div className={styles.resetActions}>
                    <button className={styles.resetBtn} onClick={onConfirm} disabled={resetting}>
                        Evet, Sıfırla
                    </button>
                    <button className="btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
                        İptal
                    </button>
                </div>
            </div>
        </div>
    );
};

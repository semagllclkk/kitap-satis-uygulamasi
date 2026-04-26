'use client';

import styles from './AdminStats.module.css';

interface StatItem {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

interface AdminStatsProps {
    stats: StatItem[];
}

export default function AdminStats({ stats }: AdminStatsProps) {
    return (
        <div className={styles.statsGrid}>
            {stats.map((s) => (
                <div key={s.label} className={`card ${styles.statCard}`}>
                    <div className={styles.statIcon}>{s.icon}</div>
                    <div className={styles.statValue} style={{ color: s.color }}>
                        {s.value}
                    </div>
                    <div className={styles.statLabel}>{s.label}</div>
                </div>
            ))}
        </div>
    );
}

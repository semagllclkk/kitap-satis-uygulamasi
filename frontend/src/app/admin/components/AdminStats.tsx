'use client';

import { Book, Order, YearlyStat } from '../types';
import styles from '../admin.module.css';

interface AdminStatsProps {
    books: Book[];
    orders: Order[];
    yearlyStats: YearlyStat[];
    totalRevenue: number;
    totalYearRevenue: number;
    totalYearOrders: number;
}

const StatItem = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
    <div className={`card ${styles.statCard}`}>
        <div className={styles.statIcon}>{icon}</div>
        <div className={styles.statValue} style={{ color }}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
    </div>
);

export const AdminStats = ({
    books,
    orders,
    yearlyStats,
    totalRevenue,
    totalYearRevenue,
    totalYearOrders,
}: AdminStatsProps) => {
    const stats = [
        { label: 'Toplam Kitap', value: books.length, icon: '📚', color: '#c084fc' },
        { label: 'Toplam Sipariş', value: orders.length, icon: '🛒', color: '#f472b6' },
        { label: 'Yıllık Sipariş', value: totalYearOrders, icon: '📅', color: '#60a5fa' },
        { label: 'Yıllık Gelir', value: `₺${totalYearRevenue.toFixed(0)}`, icon: '💰', color: '#34d399' },
        { label: 'Toplam Gelir', value: `₺${totalRevenue.toFixed(0)}`, icon: '📈', color: '#f59e0b' },
    ];

    return (
        <div className={styles.statsGrid}>
            {stats.map((stat) => (
                <StatItem key={stat.label} {...stat} />
            ))}
        </div>
    );
};

'use client';

import { BookOpen, ShoppingCart, Calendar, DollarSign, TrendingUp } from 'lucide-react';
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

const StatItem = ({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}) => (
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
        { label: 'Toplam Kitap',    value: books.length,                       icon: <BookOpen size={20} />,      color: '#c084fc' },
        { label: 'Toplam Sipariş',  value: orders.length,                      icon: <ShoppingCart size={20} />,  color: '#f472b6' },
        { label: 'Yıllık Sipariş',  value: totalYearOrders,                    icon: <Calendar size={20} />,      color: '#60a5fa' },
        { label: 'Yıllık Gelir',    value: `₺${totalYearRevenue.toFixed(0)}`,  icon: <DollarSign size={20} />,    color: '#34d399' },
        { label: 'Toplam Gelir',    value: `₺${totalRevenue.toFixed(0)}`,      icon: <TrendingUp size={20} />,    color: '#f59e0b' },
    ];

    return (
        <div className={styles.statsGrid}>
            {stats.map((stat) => (
                <StatItem key={stat.label} {...stat} />
            ))}
        </div>
    );
};

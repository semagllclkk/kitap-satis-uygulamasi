'use client';

import { Order } from '../types';
import styles from '../admin.module.css';

interface RecentOrdersProps {
    orders: Order[];
}

export const RecentOrders = ({ orders }: RecentOrdersProps) => (
    <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>📝 Son Siparişler</h2>
        </div>
        <div className={styles.tableScroll} style={{ maxHeight: '400px' }}>
            <table className={styles.table}>
                <thead className={styles.tableHead} style={{ zIndex: 10 }}>
                    <tr style={{ borderBottom: '1px solid #3d1f4a' }}>
                        <th className={styles.tableHeaderCell}>Tarih</th>
                        <th className={styles.tableHeaderCell}>Müşteri</th>
                        <th className={styles.tableHeaderCell}>Satın Alınan Kitaplar</th>
                        <th className={styles.tableHeaderCell}>Tutar</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.slice(0, 20).map((o) => (
                        <tr key={o.id}>
                            <td className={styles.tableCell}>{new Date(o.createdAt).toLocaleDateString('tr-TR')}</td>
                            <td className={styles.tableCell} style={{ fontWeight: '600', color: '#fce7f3' }}>
                                {o.user?.name || 'Bilinmiyor'} <br />
                                <span style={{ fontSize: '0.8rem', color: '#9d6db0', fontWeight: 'normal' }}>{o.user?.email}</span>
                            </td>
                            <td className={styles.tableCell}>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c084fc' }}>
                                    {o.orderDetails?.map((od) => (
                                        <li key={od.id}>
                                            {od.book?.title || 'Silinmiş Kitap'} <span style={{ color: '#9d6db0' }}>(x{od.quantity})</span>
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td className={styles.tableCell} style={{ color: '#f472b6', fontWeight: '800' }}>
                                ₺{Number(o.totalPrice).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={4} className={styles.tableCell} style={{ padding: '2rem', textAlign: 'center', color: '#9d6db0' }}>
                                Henüz hiç sipariş bulunmuyor.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

'use client';

import { Book } from '../types';
import styles from '../admin.module.css';

interface BookTableProps {
    books: Book[];
    onAdd: () => void;
    onEdit: (book: Book) => void;
    onDelete: (id: string) => void;
}

const StockBadge = ({ stock }: { stock: number }) => (
    <span
        style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: stock === 0 ? '#f8717120' : '#34d39920',
            color: stock === 0 ? '#f87171' : '#34d399',
            border: `1px solid ${stock === 0 ? '#f8717150' : '#34d39950'}`,
        }}
    >
        {stock}
    </span>
);

const BookCover = ({ imageUrl, title }: { imageUrl?: string; title: string }) => (
    imageUrl ? (
        <img src={imageUrl} alt={title} style={{ height: '40px', width: '30px', objectFit: 'cover', borderRadius: '4px', display: 'inline-block' }} />
    ) : (
        <div style={{ height: '40px', width: '30px', background: '#3d1f4a', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', margin: '0 auto' }}>
            📗
        </div>
    )
);

export const BookTable = ({ books, onAdd, onEdit, onDelete }: BookTableProps) => (
    <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>📋 Kitap Listesi</h2>
            <button className="btn-primary" onClick={onAdd} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                ＋ Yeni Kitap Ekle
            </button>
        </div>
        <div className={styles.tableScroll}>
            <table className={styles.table}>
                <thead className={styles.tableHead}>
                    <tr style={{ borderBottom: '1px solid #3d1f4a' }}>
                        <th className={styles.tableHeaderCell}>Kitap Adı</th>
                        <th className={styles.tableHeaderCell}>Yazar</th>
                        <th className={styles.tableHeaderCell}>Fiyat</th>
                        <th className={styles.tableHeaderCell} style={{ textAlign: 'center' }}>Stok</th>
                        <th className={styles.tableHeaderCell} style={{ textAlign: 'center' }}>Kapak</th>
                        <th className={styles.tableHeaderCell} style={{ textAlign: 'center' }}>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((b) => (
                        <tr key={b.id} className={styles.tableCell}>
                            <td className={styles.tableCell} style={{ fontWeight: '600' }}>{b.title}</td>
                            <td className={styles.tableCell} style={{ color: '#c084fc' }}>{b.author?.name || '—'}</td>
                            <td className={styles.tableCell} style={{ color: '#f472b6', fontWeight: '700' }}>₺{Number(b.price).toFixed(2)}</td>
                            <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                <StockBadge stock={b.stock} />
                            </td>
                            <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                <BookCover imageUrl={b.imageUrl} title={b.title} />
                            </td>
                            <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button className={styles.editBtn} onClick={() => onEdit(b)}>
                                        ✏️ Düzenle
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => onDelete(b.id)}>
                                        🗑️ Sil
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

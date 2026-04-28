'use client';

import { ClipboardList, Plus, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Book } from '../types';
import styles from '../admin.module.css';

interface BookTableProps {
    books: Book[];
    onAdd: () => void;
    onEdit: (book: Book) => void;
    onDelete: (id: string) => void;
}

const StockBadge = ({ stock }: { stock: number }) => (
    <span className={`${styles.stockBadge} ${stock === 0 ? styles.stockBadgeEmpty : styles.stockBadgeFull}`}>
        {stock}
    </span>
);

const BookCover = ({ imageUrl, title }: { imageUrl?: string; title: string }) => (
    imageUrl ? (
        <img src={imageUrl} alt={title} className={styles.bookCoverImage} />
    ) : (
        <div className={styles.bookCoverPlaceholder}>
            <BookOpen size={18} />
        </div>
    )
);

export const BookTable = ({ books, onAdd, onEdit, onDelete }: BookTableProps) => (
    <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>
                <ClipboardList size={18} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Kitap Listesi
            </h2>
            <button className="btn-primary" onClick={onAdd} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Plus size={15} /> Yeni Kitap Ekle
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
                                <div className={styles.buttonActions}>
                                    <button className={styles.editBtn} onClick={() => onEdit(b)}>
                                        <Pencil size={13} /> Düzenle
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => onDelete(b.id)}>
                                        <Trash2 size={13} /> Sil
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

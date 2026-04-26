'use client';

import { useState } from 'react';
import styles from './BookCard.module.css';

interface Book {
    id: string;
    title: string;
    price: number;
    stock: number;
    imageUrl?: string;
    author?: { name: string };
}

interface BookCardProps {
    book: Book;
    onAdd: () => void;
    adding: boolean;
}

export default function BookCard({ book, onAdd, adding }: BookCardProps) {
    const outOfStock = book.stock === 0;

    return (
        <div className={`card ${styles.card}`}>
            <div
                className={styles.bookCover}
                style={{
                    background: book.imageUrl
                        ? `url(${book.imageUrl}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #3d1f4a, #1a0f1e)',
                }}
            >
                {!book.imageUrl && '📗'}
            </div>

            <div className={styles.bookInfo}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author?.name || '—'}</p>
                <p className={styles.bookPrice}>₺{Number(book.price).toFixed(2)}</p>

                {outOfStock ? (
                    <span className={`badge badge-purple ${styles.stockBadge}`}>Stok yok</span>
                ) : (
                    <span className={styles.stockInfo}>{book.stock} adet kaldı</span>
                )}

                <button className={styles.addButton} onClick={onAdd} disabled={adding || outOfStock}>
                    {adding ? '…' : outOfStock ? 'Stok Yok' : '🛒 Sepete Ekle'}
                </button>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import BookCard from './BookCard';
import styles from './dashboard.module.css';

const API = 'http://localhost:3000';

interface Book {
    id: string;
    title: string;
    price: number;
    stock: number;
    imageUrl?: string;
    description?: string;
    publisher?: string;
    publicationYear?: string;
    author?: { name: string };
}

export default function DashboardPage() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/'); return; }
        fetchBooks();
        fetchCartCount();
    }, []);

    async function fetchBooks() {
        try {
            const res = await fetch(`${API}/books`);
            const data = await res.json();
            setBooks(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCartCount() {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        try {
            const res = await fetch(`${API}/orders/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCartCount(Array.isArray(data) ? data.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) : 0);
        } catch { /* ignore */ }
    }

    async function addToCart(bookId: string) {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        setAddingId(bookId);
        try {
            await fetch(`${API}/orders/cart/${userId}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookId, quantity: 1 }),
            });
            setToast('Sepete eklendi! 🛒');
            setTimeout(() => setToast(''), 2500);
            fetchCartCount();
        } catch {
            setToast('Hata oluştu');
            setTimeout(() => setToast(''), 2500);
        } finally {
            setAddingId(null);
        }
    }

    const filtered = books.filter(
        (b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            (b.author?.name || '').toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className={styles.container}>
            <Navbar cartCount={cartCount} />

            <main className="page">
                <div className={styles.headerSection}>
                    <h1 className={styles.pageTitle}>📖 Kitap Kataloğu</h1>
                    <p className={styles.subtitle}>{books.length} kitap mevcut</p>
                </div>

                <div className={styles.searchSection}>
                    <input
                        className="input"
                        placeholder="🔍  Kitap veya yazar ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>Yükleniyor...</div>
                ) : (
                    <div className={styles.booksGrid}>
                        {filtered.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onAdd={() => addToCart(book.id)}
                                adding={addingId === book.id}
                            />
                        ))}
                        {filtered.length === 0 && <p className={styles.emptyState}>Sonuç bulunamadı.</p>}
                    </div>
                )}
            </main>

            {toast && <div className={styles.toastContainer}>{toast}</div>}
        </div>
    );
}

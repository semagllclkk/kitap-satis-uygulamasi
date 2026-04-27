'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { AdminHeader } from './components/AdminHeader';
import { AdminStats } from './components/AdminStats';
import { BookTable } from './components/BookTable';
import { BookModal } from './components/BookModal';
import { Charts } from './components/Charts';
import { RecentOrders } from './components/RecentOrders';
import { ResetModal } from './components/ResetModal';
import { AdminFooter } from './components/AdminFooter';
import { Toast } from './components/Toast';
import { Author, Book, BookForm, Order, YearlyStat } from './types';
import {
    fetchAdminData,
    buildChartData,
    calculateStats,
    saveBook as saveBookAPI,
    deleteBook as deleteBookAPI,
    resetDatabase,
} from './helpers';
import styles from './admin.module.css';

const EMPTY_FORM: BookForm = { title: '', price: '', stock: '', isbn: '', imageUrl: '', publicationYear: '', publisher: '', authorId: '' };

export default function AdminPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [yearlyStats, setYearlyStats] = useState<YearlyStat[]>([]);
    const [loading, setLoading] = useState(true);

    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Book | null>(null);
    const [form, setForm] = useState<BookForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const token = localStorage.getItem('token');
        if (!token || role !== 'admin') {
            router.push('/');
            return;
        }
        fetchAll();
    }, []);

    const fetchAll = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const data = await fetchAdminData(token);
            setOrders(Array.isArray(data.orders) ? data.orders : []);
            setBooks(Array.isArray(data.books) ? data.books : []);
            setAuthors(Array.isArray(data.authors) ? data.authors : []);
            setYearlyStats(Array.isArray(data.yearlyStats) ? data.yearlyStats : []);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setForm(EMPTY_FORM);
        setEditing(null);
        setModal('add');
    };

    const openEdit = (book: Book) => {
        setEditing(book);
        setForm({
            title: book.title,
            price: String(book.price),
            stock: String(book.stock),
            isbn: book.isbn || '',
            imageUrl: book.imageUrl || '',
            publicationYear: book.publicationYear || '',
            publisher: book.publisher || '',
            authorId: book.authorId,
        });
        setModal('edit');
    };

    const saveBook = async () => {
        if (!form.title || !form.price || !form.stock || !form.authorId) {
            alert('Lütfen zorunlu alanları (Başlık, Fiyat, Stok, Yazar) doldurun.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        setSaving(true);
        const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };

        try {
            const res = await saveBookAPI(modal!, editing?.id || null, body, token);
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Bir hata oluştu');
                setSaving(false);
                return;
            }
            setModal(null);
            showToast(modal === 'edit' ? 'Kitap güncellendi ✓' : 'Kitap eklendi ✓');
            fetchAll();
        } catch {
            alert('Bir hata oluştu');
            setSaving(false);
        }
    };

    const removeBook = async (id: string) => {
        if (!confirm('Bu kitabı silmek istiyor musunuz?')) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await deleteBookAPI(id, token);
            showToast('Silindi ✓');
            fetchAll();
        } catch {
            alert('Silme sırasında hata oluştu');
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    const handleReset = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setResetting(true);
        setShowResetModal(false);
        try {
            await resetDatabase(token);
            window.location.reload();
        } catch {
            alert('Sıfırlama sırasında hata oluştu.');
            setResetting(false);
        }
    };

    const chartData = buildChartData(orders);
    const { totalRevenue, totalYearRevenue, totalYearOrders } = calculateStats(orders, yearlyStats);

    return (
        <div className={styles.container}>
            <Navbar />
            <main className="page" style={{ flex: 1, paddingBottom: '4rem' }}>
                <AdminHeader />
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#9d6db0' }}>Yükleniyor...</div>
                ) : (
                    <>
                        <AdminStats books={books} orders={orders} yearlyStats={yearlyStats} totalRevenue={totalRevenue} totalYearRevenue={totalYearRevenue} totalYearOrders={totalYearOrders} />
                        <BookTable books={books} onAdd={openAdd} onEdit={openEdit} onDelete={removeBook} />
                        <Charts dailyData={chartData} yearlyData={yearlyStats} />
                        <RecentOrders orders={orders} />
                    </>
                )}
            </main>

            <AdminFooter resetting={resetting} onResetClick={() => setShowResetModal(true)} />

            <BookModal mode={modal} book={editing} form={form} authors={authors} saving={saving} onFormChange={setForm} onSave={saveBook} onClose={() => setModal(null)} />
            <ResetModal show={showResetModal} resetting={resetting} onConfirm={handleReset} onCancel={() => setShowResetModal(false)} />
            <Toast message={toast} />
        </div>
    );
}

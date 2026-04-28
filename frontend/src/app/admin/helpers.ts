import { Order, YearlyStat } from './types';

const API = 'http://localhost:3000';

export const getDayLabel = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export const buildChartData = (orders: Order[]) => {
    const now = new Date();
    const days: { date: string; label: string; gelir: number }[] = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        days.push({ date: dateKey, label: getDayLabel(d.toISOString()), gelir: 0 });
    }
    for (const order of orders) {
        const dateKey = new Date(order.createdAt).toISOString().slice(0, 10);
        const day = days.find((d) => d.date === dateKey);
        if (day) day.gelir += Number(order.totalPrice);
    }
    return days;
};

export const calculateStats = (orders: Order[], yearlyStats: YearlyStat[]) => {
    const currentMonth = new Date().getMonth() + 1;
    // Nisan'dan sonrası sıfırla, cari ay live update olsun
    const filteredStats = yearlyStats.map((stat, idx) => {
        const monthNum = idx + 1;
        if (monthNum > 4 && monthNum !== currentMonth) {
            return { ...stat, gelir: 0, siparis: 0 };
        }
        if (monthNum === currentMonth) {
            const currentMonthOrders = orders.filter(o => 
                new Date(o.createdAt).getMonth() + 1 === currentMonth && 
                new Date(o.createdAt).getFullYear() === new Date().getFullYear()
            );
            return {
                ...stat,
                gelir: currentMonthOrders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
                siparis: currentMonthOrders.length
            };
        }
        return stat;
    });
    
    return {
        totalRevenue: orders.reduce((s, o) => s + Number(o.totalPrice), 0),
        totalYearRevenue: filteredStats.reduce((s, m) => s + m.gelir, 0),
        totalYearOrders: filteredStats.reduce((s, m) => s + m.siparis, 0),
    };
};

export const fetchAdminData = async (token: string) => {
    const [ordersRes, booksRes, authorsRes, yearlyRes] = await Promise.all([
        fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${API}/books`, { cache: 'no-store' }),
        fetch(`${API}/authors`, { cache: 'no-store' }),
        fetch(`${API}/orders/stats/yearly`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    ]);
    
    return {
        orders: (await ordersRes.json()),
        books: (await booksRes.json()),
        authors: (await authorsRes.json()),
        yearlyStats: (await yearlyRes.json()),
    };
};

export const saveBook = async (mode: 'add' | 'edit', bookId: string | null, body: any, token: string) => {
    const url = mode === 'edit' ? `${API}/books/${bookId}` : `${API}/books`;
    const method = mode === 'edit' ? 'PUT' : 'POST';
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    return res;
};

export const deleteBook = async (id: string, token: string) => {
    return fetch(`${API}/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const resetDatabase = async (token: string) => {
    await fetch(`${API}/admin/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    await fetch(`${API}/admin/seed-demo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
};

export const seedRandomOrders = async (token: string) => {
    const res = await fetch(`${API}/admin/seed-random`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return res.json();
};


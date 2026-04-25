'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard/page.module.css';

interface Book {
  id: string;
  name: string;
  price: number;
  stock: number;
  author?: {
    name: string;
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchWishlist(token);
  }, [router]);

  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      setWishlist(data);
    } catch (err) {
      setError('İstek listeniz yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3000/wishlist/${bookId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWishlist(wishlist.filter((book) => book.id !== bookId));
      }
    } catch (err) {
      setError('Kitap çıkarılamadı');
    }
  };

  const handleAddToCart = async (bookId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, quantity: 1 }),
      });

      if (response.ok) {
        alert('Kitap sepete eklendi!');
      }
    } catch (err) {
      setError('Sepete eklenirken hata oluştu');
    }
  };

  if (loading) {
    return <div className={styles.container}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.container}>
      <div style={{ padding: '20px' }}>
        <h1>❤️ İstek Listem ({wishlist.length})</h1>

        {error && (
          <div
            style={{
              padding: '10px',
              marginBottom: '20px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #3d1f4a',
            }}
          >
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
              İstek listeniz boş 📚
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e91e63',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Kitapları İncele
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '20px',
            }}
          >
            {wishlist.map((book) => (
              <div
                key={book.id}
                style={{
                  border: '1px solid #3d1f4a',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0 }}>{book.name}</h3>
                  <p style={{ margin: '5px 0', color: '#c084fc' }}>
                    {book.author?.name || 'Bilinmeyen Yazar'}
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '1.2rem', color: '#f472b6' }}>
                    ₺{book.price.toFixed(2)}
                  </p>
                  <p
                    style={{
                      margin: '5px 0',
                      color: book.stock > 0 ? '#4caf50' : '#f44336',
                    }}
                  >
                    {book.stock > 0 ? `Stokta var (${book.stock})` : 'Stokta yok'}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '15px',
                  }}
                >
                  <button
                    onClick={() => handleAddToCart(book.id)}
                    disabled={book.stock === 0}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: book.stock > 0 ? '#4caf50' : '#999',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: book.stock > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    🛒 Sepete Ekle
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(book.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    ❌ Çıkar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

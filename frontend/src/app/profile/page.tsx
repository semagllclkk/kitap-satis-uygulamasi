'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard/page.module.css';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      router.push('/');
      return;
    }

    fetchProfile(token, userId);
  }, [router]);

  const fetchProfile = async (token: string, userId: string) => {
    try {
      const response = await fetch('http://localhost:3000/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setFormState({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
      });
    } catch (err) {
      setError('Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isPassword = false,
  ) => {
    const { name, value } = e.target;

    if (isPassword) {
      setPasswordForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setMessage('');
      setError('');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setMessage('Profil başarıyla güncellendi!');
      setEditMode(false);

      // Update localStorage
      localStorage.setItem('userName', updatedProfile.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleChangePassword = async () => {
    try {
      setMessage('');
      setError('');

      if (passwordForm.newPassword !== passwordForm.passwordConfirm) {
        setError('Yeni şifreler eşleşmiyor');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır');
        return;
      }

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:3000/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }

      setMessage('Şifre başarıyla değiştirildi!');
      setPasswordForm({ currentPassword: '', newPassword: '', passwordConfirm: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Account deletion failed');
      }

      localStorage.clear();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account deletion failed');
    }
  };

  if (loading) {
    return <div className={styles.container}>Yükleniyor...</div>;
  }

  if (!profile) {
    return <div className={styles.container}>Profil bulunamadı</div>;
  }

  return (
    <div className={styles.container}>
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <h1>Profil Bilgileri</h1>

        {message && (
          <div
            style={{
              padding: '10px',
              marginBottom: '20px',
              backgroundColor: '#4caf50',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            {message}
          </div>
        )}

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

        {/* Profile Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#1a1a1a',
          }}
        >
          <div
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2>Kişisel Bilgiler</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: '8px 16px',
                backgroundColor: editMode ? '#f44336' : '#e91e63',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {editMode ? 'İptal Et' : 'Düzenle'}
            </button>
          </div>

          {!editMode ? (
            <div>
              <p>
                <strong>Ad Soyad:</strong> {profile.name}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Telefon:</strong> {profile.phone || 'Belirtilmemiş'}
              </p>
              <p>
                <strong>Adres:</strong> {profile.address || 'Belirtilmemiş'}
              </p>
              <p>
                <strong>Rol:</strong> {profile.role === 'admin' ? 'Admin' : 'Müşteri'}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Ad Soyad</label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Telefon</label>
                <input
                  type="text"
                  name="phone"
                  value={formState.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Adres</label>
                <input
                  type="text"
                  name="address"
                  value={formState.address}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                  }}
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          )}
        </div>

        {/* Password Change Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#1a1a1a',
          }}
        >
          <div
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2>Şifre Değiştir</h2>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              style={{
                padding: '8px 16px',
                backgroundColor: showPasswordForm ? '#f44336' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showPasswordForm ? 'İptal Et' : 'Şifre Değiştir'}
            </button>
          </div>

          {showPasswordForm && (
            <div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handleInputChange(e, true)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Yeni Şifre</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => handleInputChange(e, true)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Yeni Şifre (Doğrula)
                </label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={passwordForm.passwordConfirm}
                  onChange={(e) => handleInputChange(e, true)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                  }}
                />
              </div>

              <button
                onClick={handleChangePassword}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Şifre Değiştir
              </button>
            </div>
          )}
        </div>

        {/* Delete Account Card */}
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#1a1a1a',
          }}
        >
          <h2>Hesabı Sil</h2>
          <p>
            Hesabınızı silmek istiyorsanız aşağıdaki butona tıklayın. Bu işlem geri
            alınamaz.
          </p>
          <button
            onClick={handleDeleteAccount}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Author, Book, BookForm } from '../types';
import styles from '../admin.module.css';

const EMPTY_FORM: BookForm = { title: '', price: '', stock: '', isbn: '', imageUrl: '', publicationYear: '', publisher: '', authorId: '' };

interface BookModalProps {
    mode: 'add' | 'edit' | null;
    book: Book | null;
    form: BookForm;
    authors: Author[];
    saving: boolean;
    onFormChange: (form: BookForm) => void;
    onSave: () => void;
    onClose: () => void;
}

const FormField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
        <label className={styles.formLabel}>{label}</label>
        <input className="input" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
);

export const BookModal = ({
    mode,
    form,
    authors,
    saving,
    onFormChange,
    onSave,
    onClose,
}: BookModalProps) => {
    if (!mode) return null;

    const fields: [keyof BookForm, string][] = [
        ['title', 'Başlık *'],
        ['price', 'Fiyat *'],
        ['stock', 'Stok *'],
        ['isbn', 'ISBN'],
        ['imageUrl', 'Kapak URL'],
        ['publicationYear', 'Yayın Yılı'],
        ['publisher', 'Yayınevi'],
    ];

    return (
        <div className={styles.modal}>
            <div className={`glass ${styles.modalContent}`}>
                <h2 className={styles.modalTitle}>{mode === 'add' ? '＋ Yeni Kitap' : '✏️ Kitabı Düzenle'}</h2>
                <div className={styles.formGroup}>
                    {fields.map(([key, label]) => (
                        <FormField
                            key={key}
                            label={label}
                            value={form[key]}
                            onChange={(v) => onFormChange({ ...form, [key]: v })}
                        />
                    ))}
                    <div>
                        <label className={styles.formLabel}>Yazar *</label>
                        <select
                            className="input"
                            aria-label="Yazar"
                            value={form.authorId}
                            onChange={(e) => onFormChange({ ...form, authorId: e.target.value })}
                        >
                            <option value="">Seçin…</option>
                            {authors.map((a) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.formActions}>
                    <button className="btn-primary" onClick={onSave} disabled={saving} style={{ flex: 1 }}>
                        {saving ? '…' : '💾 Kaydet'}
                    </button>
                    <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
                        İptal
                    </button>
                </div>
            </div>
        </div>
    );
};

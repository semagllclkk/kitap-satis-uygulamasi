import { Book, Order, Author, YearlyStat } from '../admin/types';

export interface AdminPageState {
    orders: Order[];
    books: Book[];
    authors: Author[];
    yearlyStats: YearlyStat[];
    loading: boolean;
}

export interface AdminPageModal {
    type: 'add' | 'edit' | null;
    editing: Book | null;
    isOpen: boolean;
}

export interface AdminPageActions {
    openAddModal: () => void;
    openEditModal: (book: Book) => void;
    closeModal: () => void;
    handleSaveBook: (form: any) => Promise<void>;
    handleDeleteBook: (bookId: string) => Promise<void>;
    handleReset: () => Promise<void>;
}

export interface Order {
    id: string;
    totalPrice: number;
    createdAt: string;
    user?: { name: string; email: string };
    orderDetails?: {
        id: string;
        quantity: number;
        price: number;
        book?: { title: string };
    }[];
}

export interface Author {
    id: string;
    name: string;
}

export interface Book {
    id: string;
    title: string;
    price: number;
    stock: number;
    isbn?: string;
    imageUrl?: string;
    publicationYear?: string;
    publisher?: string;
    authorId: string;
    author?: { name: string };
}

export interface YearlyStat {
    month: string;
    gelir: number;
    siparis: number;
}

export interface BookForm {
    title: string;
    price: string;
    stock: string;
    isbn: string;
    imageUrl: string;
    publicationYear: string;
    publisher: string;
    authorId: string;
}

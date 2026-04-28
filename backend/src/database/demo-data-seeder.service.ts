import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author, Book, User, Order, OrderDetails } from '../entities';

@Injectable()
export class DemoDataSeederService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
  ) {}

  async seedDemoData(): Promise<{ message: string }> {
    const authorCount = await this.authorRepository.count();
    const bookCount   = await this.bookRepository.count();
    if (authorCount > 0 && bookCount > 0) {
      return { message: 'Demo veriler zaten mevcut, atlandı.' };
    }

    const authors = await this.createDemoAuthors();
    const books = await this.createDemoBooks(authors);
    const users = await this.createDemoUsers();
    await this.createDemoOrders(users, books);

    return { message: 'Demo veriler başarıyla yüklendi.' };
  }

  /** Grafik test butonu için: mevcut kitaplara random sipariş ekler */
  async seedRandomOrders(): Promise<{ message: string }> {
    const books = await this.bookRepository.find();
    const users = await this.userRepository.find({ where: { role: 'customer' } });

    if (books.length === 0 || users.length === 0) {
      return { message: 'Kitap veya kullanıcı bulunamadı.' };
    }

    const now = new Date();
    const year = now.getFullYear();

    // Ocak-Mart: her ay 3-5 sipariş
    for (let month = 0; month <= 2; month++) {
      const count = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < count; i++) {
        const day = Math.floor(Math.random() * 25) + 1;
        await this.saveOrder(users, books, new Date(year, month, day, 10));
      }
    }

    // Nisan 1 → 4 gün önce: %60 ihtimalle günlük
    const fourDaysAgo = new Date(year, now.getMonth(), now.getDate() - 4);
    for (let d = new Date(year, 3, 1); d < fourDaysAgo; d.setDate(d.getDate() + 1)) {
      if (Math.random() < 0.6) {
        await this.saveOrder(users, books, new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10));
      }
    }

    // Son 4 gün: günde 1-2 sipariş
    for (let daysAgo = 4; daysAgo >= 1; daysAgo--) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const date = new Date(year, now.getMonth(), now.getDate() - daysAgo, 10 + i);
        await this.saveOrder(users, books, date);
      }
    }

    return { message: 'Random sipariş verileri eklendi.' };
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private async saveOrder(users: User[], books: Book[], date: Date) {
    const user  = this.pick(users);
    const book1 = this.pick(books);
    const book2 = this.pick(books);
    const total = Number(book1.price) + Number(book2.price);

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        user, userId: user.id,
        status: 'completed',
        totalPrice: total, totalQuantity: 2,
        createdAt: date, updatedAt: date,
      }),
    );
    await this.orderDetailsRepository.save([
      this.orderDetailsRepository.create({ order, orderId: order.id, book: book1, bookId: book1.id, quantity: 1, price: book1.price }),
      this.orderDetailsRepository.create({ order, orderId: order.id, book: book2, bookId: book2.id, quantity: 1, price: book2.price }),
    ]);
  }

  private async createDemoAuthors() {
    const authorsData = [
      { name: 'Orhan Pamuk',        biography: 'Türk yazarı ve Nobel Ödülü sahibi',  birthDate: '1952-06-07', nationality: 'Türkiye' },
      { name: 'Elif Şafak',         biography: 'Uluslararası ünlü Türk yazarı',       birthDate: '1971-10-25', nationality: 'Türkiye' },
      { name: 'Victor Hugo',        biography: 'Fransız yazar ve şair',               birthDate: '1802-02-26', nationality: 'Fransa'  },
      { name: 'Fyodor Dostoyevski', biography: 'Rus yazar, psikolojik roman ustası',  birthDate: '1821-11-11', nationality: 'Rusya'   },
      { name: 'Honoré de Balzac',   biography: 'Fransız yazar, realizmin öncüsü',     birthDate: '1799-05-20', nationality: 'Fransa'  },
    ];
    return Promise.all(
      authorsData.map(d => this.authorRepository.save(this.authorRepository.create(d))),
    );
  }

  private async createDemoBooks(authors: Author[]) {
    const booksData = [
      {
        title: '10 Dakika 38 Saniye',
        description: 'Elif Şafak\'ın ölüm anında geçmişi sorgulayan güçlü romanı',
        price: 38.0, stock: 19, isbn: '978-9753872318', publicationYear: '2019',
        publisher: 'Doğan Kitap', author: authors[1],
        imageUrl: '/uploads/10-dakika-38-saniye.jpg',
      },
      {
        title: 'Bir İdam Mahkumunun Son Günü',
        description: 'Victor Hugo\'nun idam cezasını sorgulayan güçlü eseri',
        price: 28.75, stock: 25, isbn: '978-9753870894', publicationYear: '2004',
        publisher: 'Everest', author: authors[2],
        imageUrl: '/uploads/bir-idam-mahkumunun-son-gunu.jpg',
      },
      {
        title: 'Masumiyet Müzesi',
        description: 'Orhan Pamuk\'ın İstanbul\'da geçen aşk ve nostalji romanı',
        price: 42.0, stock: 18, isbn: '978-9753863789', publicationYear: '2008',
        publisher: 'İletişim', author: authors[0],
        imageUrl: '/uploads/masumiyet-muzesi.jpg',
      },
      {
        title: 'Suç ve Ceza',
        description: 'Dostoyevski\'nin psikolojik gerilim başyapıtı',
        price: 39.99, stock: 17, isbn: '978-9753850285', publicationYear: '2003',
        publisher: 'İletişim', author: authors[3],
        imageUrl: '/uploads/suc-ve-ceza.jpg',
      },
      {
        title: 'Vadideki Zambak',
        description: 'Balzac\'ın romantizm ve gerçekçiliği harmanlayan eseri',
        price: 32.5, stock: 22, isbn: '978-9753871601', publicationYear: '2000',
        publisher: 'Everest', author: authors[4],
        imageUrl: '/uploads/vadideki-zambak.jpg',
      },
    ];
    return Promise.all(
      booksData.map(d => this.bookRepository.save(this.bookRepository.create(d))),
    );
  }

  private async createDemoUsers() {
    const usersData = [
      { email: 'ahmet@example.com',  name: 'Ahmet Yılmaz', password: 'hashedPassword123', role: 'customer' as const, phone: '+90 555 123 4567', address: 'İstanbul, Türkiye' },
      { email: 'ayse@example.com',   name: 'Ayşe Kaya',    password: 'hashedPassword456', role: 'customer' as const, phone: '+90 555 234 5678', address: 'Ankara, Türkiye'  },
      { email: 'mehmet@example.com', name: 'Mehmet Demir', password: 'hashedPassword789', role: 'customer' as const, phone: '+90 555 345 6789', address: 'İzmir, Türkiye'   },
    ];
    return Promise.all(
      usersData.map(d => this.userRepository.save(this.userRepository.create(d))),
    );
  }

  private async createDemoOrders(users: User[], books: Book[]) {
    const now  = new Date();
    const year = now.getFullYear();
    const todayMidnight = new Date(year, now.getMonth(), now.getDate());

    // Ocak–Mart
    for (let month = 0; month <= 2; month++) {
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        await this.saveOrder(users, books, new Date(year, month, Math.floor(Math.random() * 25) + 1, 10));
      }
    }

    // Nisan 1 → 4 gün önce: %60 ihtimalle
    const fourDaysAgo = new Date(todayMidnight);
    fourDaysAgo.setDate(todayMidnight.getDate() - 4);
    for (let d = new Date(year, 3, 1); d < fourDaysAgo; d.setDate(d.getDate() + 1)) {
      if (Math.random() < 0.6) {
        await this.saveOrder(users, books, new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10));
      }
    }

    // Son 4 gün → dün
    for (let daysAgo = 4; daysAgo >= 1; daysAgo--) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        await this.saveOrder(users, books, new Date(year, now.getMonth(), now.getDate() - daysAgo, 10 + i));
      }
    }
  }
}

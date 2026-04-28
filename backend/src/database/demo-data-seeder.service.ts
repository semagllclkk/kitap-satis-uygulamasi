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
    const existingCount = await this.authorRepository.count();
    if (existingCount > 0) {
      return { message: 'Demo veriler zaten mevcut, atlandı.' };
    }

    const authors = await this.createDemoAuthors();
    const books = await this.createDemoBooks(authors);
    const users = await this.createDemoUsers();
    await this.createDemoOrders(users, books);

    return { message: 'Demo veriler başarıyla yüklendi.' };
  }

  private async createDemoAuthors() {
    const authorsData = [
      { name: 'Orhan Pamuk', biography: 'Türk yazarı ve Nobel Ödülü sahibi', birthDate: '1952-06-07', nationality: 'Türkiye' },
      { name: 'Ahmet Ümit', biography: 'Türk yazarı ve senarist', birthDate: '1955-12-21', nationality: 'Türkiye' },
      { name: 'Elif Şafak', biography: 'Uluslararası ünlü Türk yazarı', birthDate: '1971-10-25', nationality: 'Türkiye' },
      { name: 'Victor Hugo', biography: 'Fransız yazar ve şair', birthDate: '1802-02-26', nationality: 'Fransa' },
      { name: 'Fyodor Dostoyevski', biography: 'Rus yazar, psikolojik roman ustası', birthDate: '1821-11-11', nationality: 'Rusya' },
    ];
    return Promise.all(authorsData.map(d => this.authorRepository.save(this.authorRepository.create(d))));
  }

  private async createDemoBooks(authors: Author[]) {
    const booksData = [
      {
        title: '10 Dakika 38 Saniye',
        description: 'Elif Şafak\'ın ölüm anında geçmişi sorgulayan güçlü romanı',
        price: 38.0, stock: 19, isbn: '978-9753872318', publicationYear: '2019',
        publisher: 'Doğan Kitap', author: authors[2],
        imageUrl: '/uploads/10-dakika-38-saniye.jpg',
      },
      {
        title: 'Bir İdam Mahkumunun Son Günü',
        description: 'Victor Hugo\'nun idam cezasını sorgulayan güçlü eseri',
        price: 28.75, stock: 25, isbn: '978-9753870894', publicationYear: '2004',
        publisher: 'Everest', author: authors[3],
        imageUrl: '/uploads/bir-idam-mahkumunun-son-gunu.jpg',
      },
      {
        title: 'Masumiyet Müzesi',
        description: 'Orhan Pamuk\'ın İstanbul\'da geçen aşk ve nostaljı romanı',
        price: 42.0, stock: 18, isbn: '978-9753863789', publicationYear: '2008',
        publisher: 'İletişim', author: authors[0],
        imageUrl: '/uploads/masumiyet-muzesi.jpg',
      },
      {
        title: 'Suç ve Ceza',
        description: 'Dostoyevski\'nin psikolojik gerilim başyapıtı',
        price: 39.99, stock: 17, isbn: '978-9753850285', publicationYear: '2003',
        publisher: 'İletişim', author: authors[4],
        imageUrl: '/uploads/suc-ve-ceza.jpg',
      },
      {
        title: 'Vadideki Zambak',
        description: 'Balzac\'ın romantizm ve gerçekçiliği harmanlayan eseri',
        price: 32.5, stock: 22, isbn: '978-9753871601', publicationYear: '2000',
        publisher: 'Everest', author: authors[1],
        imageUrl: '/uploads/vadideki-zambak.jpg',
      },
    ];
    return Promise.all(booksData.map(d => this.bookRepository.save(this.bookRepository.create(d))));
  }

  private async createDemoUsers() {
    const usersData = [
      { email: 'ahmet@example.com', name: 'Ahmet Yılmaz', password: 'hashedPassword123', role: 'customer' as const, phone: '+90 555 123 4567', address: 'İstanbul, Türkiye' },
      { email: 'ayse@example.com', name: 'Ayşe Kaya', password: 'hashedPassword456', role: 'customer' as const, phone: '+90 555 234 5678', address: 'Ankara, Türkiye' },
      { email: 'mehmet@example.com', name: 'Mehmet Demir', password: 'hashedPassword789', role: 'customer' as const, phone: '+90 555 345 6789', address: 'İzmir, Türkiye' },
    ];
    return Promise.all(usersData.map(d => this.userRepository.save(this.userRepository.create(d))));
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private async createDemoOrders(users: User[], books: Book[]) {
    const now = new Date();
    const year = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // --- Aylık random siparişler: İlk 4 ay (0-3), ama currentMonth'u aşma ---
    const maxMonth = Math.min(3, currentMonth - 1); // 4 gün öncesi zaten dahil
    for (let month = 0; month <= maxMonth; month++) {
      const numOrders = Math.floor(Math.random() * 3) + 2; // 2-4 sipariş/ay
      for (let i = 0; i < numOrders; i++) {
        const user = this.pick(users);
        const book1 = this.pick(books);
        const book2 = this.pick(books);
        const day = Math.floor(Math.random() * 25) + 1;
        const orderDate = new Date(year, month, day);
        const total = Number(book1.price) + Number(book2.price);

        const order = await this.orderRepository.save(
          this.orderRepository.create({
            user, userId: user.id,
            status: 'completed',
            totalPrice: total, totalQuantity: 2,
            createdAt: orderDate, updatedAt: orderDate,
          }),
        );

        await this.orderDetailsRepository.save([
          this.orderDetailsRepository.create({ order, orderId: order.id, book: book1, bookId: book1.id, quantity: 1, price: book1.price }),
          this.orderDetailsRepository.create({ order, orderId: order.id, book: book2, bookId: book2.id, quantity: 1, price: book2.price }),
        ]);
      }
    }

    // --- Günlük veriler: Bugünden 4 gün önce → dün (bugün dahil değil) ---
    for (let daysAgo = 4; daysAgo >= 1; daysAgo--) {
      const date = new Date(now);
      date.setDate(now.getDate() - daysAgo);
      date.setHours(10, 0, 0, 0);

      const numOrders = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numOrders; i++) {
        const user = this.pick(users);
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
    }
  }
}

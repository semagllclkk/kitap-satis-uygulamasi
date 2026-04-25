import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Author, Book, Order, OrderDetails, Cart } from '../entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async resetDatabase(): Promise<{ message: string }> {
    const demoAuthors = ['Orhan Pamuk', 'Ahmet Ümit', 'Elif Şafak', 'Fyodor Dostoyevski', 'Victor Hugo', 'Honoré de Balzac'];
    const demoBooks = ['Kar', 'Beyaz Kale', 'Dehşet', '10 Dakika 38 Saniye', 'İstanbul Müzesi', 'Suç ve Ceza', 'Bir İdam Mahkumunun Son Günü', 'Vadideki Zambak'];

    // 1. Random Kitapları Sil
    const randomBooks = await this.bookRepository.createQueryBuilder('book')
      .where('book.title NOT IN (:...titles)', { titles: demoBooks })
      .getMany();

    if (randomBooks.length > 0) {
      const bookIds = randomBooks.map((b) => b.id);

      const orderDetails = await this.orderDetailsRepository.createQueryBuilder('od')
        .where('od.bookId IN (:...bookIds)', { bookIds })
        .getMany();

      if (orderDetails.length > 0) {
        for (const od of orderDetails) {
          const order = await this.orderRepository.findOne({ where: { id: od.orderId } });
          if (order) {
            order.totalPrice -= Number(od.price) * od.quantity;
            order.totalQuantity -= od.quantity;
            await this.orderRepository.save(order);
          }
        }
        await this.orderDetailsRepository.delete(orderDetails.map((od) => od.id));
      }

      await this.cartRepository.createQueryBuilder()
        .where('bookId IN (:...bookIds)', { bookIds })
        .delete()
        .execute();

      await this.bookRepository.delete(bookIds);
    }

    // 2. Random Yazarları Sil
    const randomAuthors = await this.authorRepository.createQueryBuilder('author')
      .where('author.name NOT IN (:...names)', { names: demoAuthors })
      .getMany();

    if (randomAuthors.length > 0) {
      await this.authorRepository.delete(randomAuthors.map((a) => a.id));
    }

    // 3. İçi boşalan siparişleri sil
    await this.orderRepository.createQueryBuilder()
      .where('totalQuantity <= 0')
      .delete()
      .execute();

    // Not: Artık kullanıcıları veya geçerli siparişleri silmiyoruz!

    return {
      message: 'Sadece test amacıyla eklenen random veriler temizlendi.',
    };
  }

  async seedDemoData(): Promise<{ message: string }> {
    // Sadece 'Fyodor Dostoyevski' yoksa ekle (Idempotency için)
    const dostoyevski = await this.authorRepository.findOne({ where: { name: 'Fyodor Dostoyevski' } });
    if (dostoyevski) {
      return { message: 'Demo veriler zaten mevcut, atlandı.' };
    }

    // Mevcut yazarları çek ki duplicate olmasın
    let orhanPamuk = await this.authorRepository.findOne({ where: { name: 'Orhan Pamuk' } });
    if (!orhanPamuk) {
      orhanPamuk = await this.authorRepository.save(this.authorRepository.create({ name: 'Orhan Pamuk', biography: 'Türk yazarı ve Nobel Ödülü sahibi', birthDate: '1952-06-07', nationality: 'Türkiye' }));
    }

    let ahmetUmit = await this.authorRepository.findOne({ where: { name: 'Ahmet Ümit' } });
    if (!ahmetUmit) {
      ahmetUmit = await this.authorRepository.save(this.authorRepository.create({ name: 'Ahmet Ümit', biography: 'Türk yazarı ve senarist', birthDate: '1955-12-21', nationality: 'Türkiye' }));
    }

    let elifSafak = await this.authorRepository.findOne({ where: { name: 'Elif Şafak' } });
    if (!elifSafak) {
      elifSafak = await this.authorRepository.save(this.authorRepository.create({ name: 'Elif Şafak', biography: 'Uluslararası ünlü Türk yazarı', birthDate: '1971-10-25', nationality: 'Türkiye' }));
    }

    const fyodorDostoyevski = await this.authorRepository.save(this.authorRepository.create({
      name: 'Fyodor Dostoyevski',
      biography: 'Rus roman yazarı, dünya edebiyatının en önemli isimlerinden',
      birthDate: '1821-11-11',
      nationality: 'Rusya',
    }));

    const victorHugo = await this.authorRepository.save(this.authorRepository.create({
      name: 'Victor Hugo',
      biography: 'Fransız yazar, şair ve oyun yazarı, Romantizm akımının öncüsü',
      birthDate: '1802-02-26',
      nationality: 'Fransa',
    }));

    const honoreDeBalzac = await this.authorRepository.save(this.authorRepository.create({
      name: 'Honoré de Balzac',
      biography: 'Fransız yazar, edebiyatta realizm akımının kurucularından',
      birthDate: '1799-05-20',
      nationality: 'Fransa',
    }));

    const savedOrhanPamuk = orhanPamuk;
    const savedAhmetUmit = ahmetUmit;
    const savedElifSafak = elifSafak;
    const savedFyodorDostoyevski = fyodorDostoyevski;
    const savedVictorHugo = victorHugo;
    const savedHonoreDeBalzac = honoreDeBalzac;



    // Demo kitaplar
    const books = [
      {
        title: 'Kar',
        author: savedOrhanPamuk,
        description: 'Kars şehrinde geçen, tasavvufi bir roman',
        price: 45.99,
        stock: 20,
        isbn: '978-9753862745',
        publicationYear: '2002',
        publisher: 'İletişim',
        imageUrl:
          '/uploads/kar.jpg',
      },
      {
        title: 'Beyaz Kale',
        author: savedOrhanPamuk,
        description: 'Tarihsel ve fantastik unsurları bir araya getiren roman',
        price: 35.5,
        stock: 15,
        isbn: '978-9753860268',
        publicationYear: '1985',
        publisher: 'İletişim',
        imageUrl:
          '/uploads/beyaz-kale.jpg',
      },
      {
        title: 'Dehşet',
        author: savedAhmetUmit,
        description: 'Gerilim ve esrar dolu, polisiye bir roman',
        price: 28.75,
        stock: 25,
        isbn: '978-9753870894',
        publicationYear: '2004',
        publisher: 'Everest',
        imageUrl:
          '/uploads/dehset.jpg',
      },
      {
        title: '10 Dakika 38 Saniye',
        author: savedElifSafak,
        description: 'Felsefik ve duygusal bir aşk hikayesi',
        price: 32.0,
        stock: 18,
        isbn: '978-9753861452',
        publicationYear: '2001',
        publisher: 'İletişim',
        imageUrl:
          '/uploads/10-dakika.jpg',
      },
      {
        title: 'İstanbul Müzesi',
        author: savedOrhanPamuk,
        description: 'İstanbulun tarihini anlatışı',
        price: 50.0,
        stock: 12,
        isbn: '978-9753869873',
        publicationYear: '2012',
        publisher: 'İletişim',
        imageUrl:
          '/uploads/istanbul-muzesi.jpg',
      },
      {
        title: 'Suç ve Ceza',
        author: savedFyodorDostoyevski,
        description: 'Raskolnikov\'un psikolojik çalkantılarını ve vicdan azabını işleyen başyapıt',
        price: 65.0,
        stock: 30,
        isbn: '978-9750719385',
        publicationYear: '1866',
        publisher: 'Can Yayınları',
        imageUrl:
          '/uploads/suc-ve-ceza.jpg',
      },
      {
        title: 'Bir İdam Mahkumunun Son Günü',
        author: savedVictorHugo,
        description: 'Ölüm cezasına çarptırılmış bir adamın son günlerini anlatan çarpıcı bir eser',
        price: 25.5,
        stock: 45,
        isbn: '978-6053328222',
        publicationYear: '1829',
        publisher: 'İş Bankası Kültür Yayınları',
        imageUrl:
          '/uploads/bir-idam-mahkumunun-son-gunu.jpg',
      },
      {
        title: 'Vadideki Zambak',
        author: savedHonoreDeBalzac,
        description: 'Saf bir aşk ile toplumsal beklentiler arasındaki çatışmayı anlatan klasik roman',
        price: 40.0,
        stock: 15,
        isbn: '978-6053327669',
        publicationYear: '1835',
        publisher: 'İş Bankası Kültür Yayınları',
        imageUrl:
          '/uploads/vadideki-zambak.jpg',
      },
    ];

    const savedBooks: Book[] = [];
    for (const bookData of books) {
      let book = await this.bookRepository.findOne({ where: { title: bookData.title } });
      if (!book) {
        book = this.bookRepository.create(bookData);
        savedBooks.push(await this.bookRepository.save(book));
      }
    }

    // Demo Siparişler (Satış verisi grafikleri için)
    const customer = await this.userRepository.findOne({ where: { email: 'musteri@kitabevi.com' } });
    if (customer && savedBooks.length > 0) {
      const orders = [];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      // Geçmiş aylara ait rastgele siparişler oluştur (Sadece bulunduğumuz aya kadar)
      for (let month = 0; month <= currentMonth; month++) {
        // Her ay için 1-3 arası rastgele sipariş
        const numOrders = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numOrders; i++) {
          const book1 = savedBooks[Math.floor(Math.random() * savedBooks.length)];
          const book2 = savedBooks[Math.floor(Math.random() * savedBooks.length)];
          
          const orderDate = new Date(currentYear, month, Math.floor(Math.random() * 28) + 1);
          
          const order = this.orderRepository.create({
            user: customer,
            userId: customer.id,
            status: 'completed',
            totalPrice: Number(book1.price) + Number(book2.price),
            totalQuantity: 2,
            createdAt: orderDate,
            updatedAt: orderDate,
          });
          
          const savedOrder = await this.orderRepository.save(order);
          
          await this.orderDetailsRepository.save([
            this.orderDetailsRepository.create({
              order: savedOrder,
              orderId: savedOrder.id,
              book: book1,
              bookId: book1.id,
              quantity: 1,
              price: book1.price,
            }),
            this.orderDetailsRepository.create({
              order: savedOrder,
              orderId: savedOrder.id,
              book: book2,
              bookId: book2.id,
              quantity: 1,
              price: book2.price,
            })
          ]);
        }
      }
    }

    return { message: 'Demo veriler başarıyla eklendi' };
  }

  async getStats(): Promise<any> {
    const userCount = await this.userRepository.count();
    const bookCount = await this.bookRepository.count();
    const authorCount = await this.authorRepository.count();
    const orderCount = await this.orderRepository.count();

    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .getRawOne();

    return {
      users: userCount,
      books: bookCount,
      authors: authorCount,
      orders: orderCount,
      totalRevenue: Number(totalRevenue?.total) || 0,
    };
  }

  async getAllUsers(): Promise<any[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'role', 'createdAt'],
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    await this.userRepository.delete(id);
    return { message: 'Kullanıcı silindi' };
  }
}

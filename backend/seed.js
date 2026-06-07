import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import Banner from './models/Banner.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();

    console.log('Cleared existing collections.');

    // Seed Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      phone: '01712345678',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'customer@example.com',
      phone: '01812345678',
      password: 'customer123',
      role: 'customer',
      isVerified: true,
    });

    console.log('Seeded Users.');

    // Seed Categories
    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Smartphones, Laptops, Audio, Gaming and Accessories.',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=300&auto=format&fit=crop',
    });

    const fashion = await Category.create({
      name: 'Fashion',
      description: 'Premium Apparel, Lifestyle Footwear, and activewear.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=300&auto=format&fit=crop',
    });

    const home = await Category.create({
      name: 'Home & Living',
      description: 'Modern office desks, ergonomic chairs, and furniture.',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop',
    });

    console.log('Seeded Categories.');

    // Seed Brands
    const brandApple = await Brand.create({
      name: 'Apple',
      logo: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=150&auto=format&fit=crop',
      description: 'Premium consumer electronics maker.',
    });

    const brandNike = await Brand.create({
      name: 'Nike',
      logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150&auto=format&fit=crop',
      description: 'Athletic wear and footwear giant.',
    });

    const brandSony = await Brand.create({
      name: 'Sony',
      logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=150&auto=format&fit=crop',
      description: 'Global electronics and entertainment giant.',
    });

    const brandSamsung = await Brand.create({
      name: 'Samsung',
      logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=150&auto=format&fit=crop',
      description: 'Innovative displays and smart devices.',
    });

    const brandAdidas = await Brand.create({
      name: 'Adidas',
      logo: 'https://images.unsplash.com/photo-1518002171953-a080ee81be25?q=80&w=150&auto=format&fit=crop',
      description: 'Casual and performance apparel and sneakers.',
    });

    const brandKeychron = await Brand.create({
      name: 'Keychron',
      logo: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=150&auto=format&fit=crop',
      description: 'Premium mechanical keyboards.',
    });

    const brandIkea = await Brand.create({
      name: 'Ikea',
      logo: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=150&auto=format&fit=crop',
      description: 'Minimalist Scandinavian ready-to-assemble furniture.',
    });

    console.log('Seeded Brands.');

    // Seed Products
    const products = [
      // ELECTRONICS
      {
        name: 'iPhone 15 Pro',
        sku: 'IPHONE15PRO-128',
        description: 'The latest iPhone 15 Pro featuring titanium body, A17 Pro chip, and advanced triple camera setup.',
        brand: brandApple._id,
        category: electronics._id,
        price: 999.00,
        suggestedPrice: 1049.00,
        discountPrice: 949.00,
        stockQuantity: 25,
        images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=500&auto=format&fit=crop'],
        rating: 4.8,
        reviewCount: 12,
        isVisible: true,
        promoLabel: 'New',
      },
      {
        name: 'AirPods Pro 2',
        sku: 'AIRPODSPRO-2',
        description: 'Active Noise Cancelling wireless earphones with MagSafe charging case and customized fit.',
        brand: brandApple._id,
        category: electronics._id,
        price: 249.00,
        suggestedPrice: 259.00,
        discountPrice: 219.00,
        stockQuantity: 50,
        images: ['https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=500&auto=format&fit=crop'],
        rating: 4.6,
        reviewCount: 45,
        isVisible: true,
        promoLabel: 'Trending',
      },
      {
        name: 'Sony WH-1000XM5',
        sku: 'SONYXM5-BLACK',
        description: 'Industry leading noise cancelling over-ear headphones with 30-hour battery life.',
        brand: brandSony._id,
        category: electronics._id,
        price: 399.00,
        suggestedPrice: 419.00,
        discountPrice: 349.00,
        stockQuantity: 15,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop'],
        rating: 4.7,
        reviewCount: 30,
        isVisible: true,
        promoLabel: 'Popular',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        sku: 'S24ULTRA-256',
        description: 'Premium Android smartphone with 200MP camera, built-in S-Pen, and Galaxy AI tools.',
        brand: brandSamsung._id,
        category: electronics._id,
        price: 1299.00,
        suggestedPrice: 1299.00,
        discountPrice: 1199.00,
        stockQuantity: 12,
        images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop'],
        rating: 4.9,
        reviewCount: 22,
        isVisible: true,
        promoLabel: 'New',
      },
      {
        name: 'Keychron K2 Keyboard',
        sku: 'KEYCHRONK2-RGB',
        description: 'Compact 75% layout wireless mechanical keyboard with Gateron hot-swappable switches and RGB lighting.',
        brand: brandKeychron._id,
        category: electronics._id,
        price: 99.00,
        suggestedPrice: 109.00,
        discountPrice: 89.00,
        stockQuantity: 30,
        images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=500&auto=format&fit=crop'],
        rating: 4.5,
        reviewCount: 18,
        isVisible: true,
        promoLabel: 'Popular',
      },
      {
        name: 'PlayStation 5 Console',
        sku: 'PS5-SLIM-DISC',
        description: 'Sony PlayStation 5 Slim Disc Edition featuring custom CPU, lightning fast SSD, and 3D audio.',
        brand: brandSony._id,
        category: electronics._id,
        price: 499.00,
        suggestedPrice: 519.00,
        discountPrice: 0,
        stockQuantity: 8,
        images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=500&auto=format&fit=crop'],
        rating: 4.8,
        reviewCount: 64,
        isVisible: true,
        promoLabel: 'Trending',
      },
      {
        name: 'Apple Watch Ultra 2',
        sku: 'WATCHULTRA2-GPS',
        description: 'The ultimate sports watch with titanium case, dual-frequency GPS, and up to 36 hours battery life.',
        brand: brandApple._id,
        category: electronics._id,
        price: 799.00,
        suggestedPrice: 829.00,
        discountPrice: 0,
        stockQuantity: 10,
        images: ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=500&auto=format&fit=crop'],
        rating: 4.7,
        reviewCount: 14,
        isVisible: true,
        promoLabel: 'New',
      },
      {
        name: 'Samsung Galaxy Watch 6',
        sku: 'GALAXYWATCH-6',
        description: 'Sleek fitness tracking smartwatch with personalized heart monitoring, sleep analyzer, and custom faces.',
        brand: brandSamsung._id,
        category: electronics._id,
        price: 299.00,
        suggestedPrice: 329.00,
        discountPrice: 269.00,
        stockQuantity: 14,
        images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=500&auto=format&fit=crop'],
        rating: 4.6,
        reviewCount: 10,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Sony Soundbar HT-S20R',
        sku: 'SONY-SOUNDBAR-S20R',
        description: '5.1 channel home theater soundbar system with rear speakers and subwoofer, Bluetooth support.',
        brand: brandSony._id,
        category: electronics._id,
        price: 199.00,
        suggestedPrice: 229.00,
        discountPrice: 179.00,
        stockQuantity: 6,
        images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=500&auto=format&fit=crop'],
        rating: 4.4,
        reviewCount: 19,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Keychron Coiled Cable',
        sku: 'KEYCHRON-CABLE-RED',
        description: 'Aviator-connected custom coiled USB-C cable for mechanical keyboards, heavy-duty double-sleeved.',
        brand: brandKeychron._id,
        category: electronics._id,
        price: 25.00,
        suggestedPrice: 29.00,
        discountPrice: 0,
        stockQuantity: 100,
        images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=500&auto=format&fit=crop'],
        rating: 4.8,
        reviewCount: 40,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'iPad Air M1',
        sku: 'IPADAIR-M1-256',
        description: 'Supercharged by the Apple M1 chip. 10.9-inch Liquid Retina display, 12MP Ultra Wide front camera.',
        brand: brandApple._id,
        category: electronics._id,
        price: 599.00,
        suggestedPrice: 629.00,
        discountPrice: 569.00,
        stockQuantity: 18,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500&auto=format&fit=crop'],
        rating: 4.7,
        reviewCount: 25,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'MacBook Air M2',
        sku: 'MACBOOKAIR-M2-8',
        description: 'Redesigned thin aluminum body laptop. Powered by next-gen M2 chip, 13.6-inch Liquid Retina display.',
        brand: brandApple._id,
        category: electronics._id,
        price: 1099.00,
        suggestedPrice: 1149.00,
        discountPrice: 999.00,
        stockQuantity: 10,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop'],
        rating: 4.9,
        reviewCount: 38,
        isVisible: true,
        promoLabel: 'New',
      },
      {
        name: 'Samsung Galaxy Tab S9',
        sku: 'GALAXYTABS9-128',
        description: '11-inch AMOLED 120Hz display Android tablet, IP68 water resistance, and included low-latency S-Pen.',
        brand: brandSamsung._id,
        category: electronics._id,
        price: 799.00,
        suggestedPrice: 799.00,
        discountPrice: 729.00,
        stockQuantity: 15,
        images: ['https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?q=80&w=500&auto=format&fit=crop'],
        rating: 4.6,
        reviewCount: 12,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Samsung Galaxy Buds 2 Pro',
        sku: 'GALAXYBUDS2PRO',
        description: '24-bit Hi-Fi audio wireless earbuds, intelligent active noise cancelling, and 360 audio mapping.',
        brand: brandSamsung._id,
        category: electronics._id,
        price: 229.00,
        suggestedPrice: 229.00,
        discountPrice: 189.00,
        stockQuantity: 30,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=500&auto=format&fit=crop'],
        rating: 4.5,
        reviewCount: 22,
        isVisible: true,
        promoLabel: 'Sale',
      },
      {
        name: 'Sony Bravia 4K Smart TV',
        sku: 'SONY-BRAVIA-55',
        description: '55-inch 4K Ultra HD HDR smart television powered by Processor X1, Google TV interface.',
        brand: brandSony._id,
        category: electronics._id,
        price: 649.00,
        suggestedPrice: 699.00,
        discountPrice: 599.00,
        stockQuantity: 5,
        images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=500&auto=format&fit=crop'],
        rating: 4.7,
        reviewCount: 14,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Sony DualSense Controller',
        sku: 'PS5-DUALSENSE-WHT',
        description: 'Immersive tactile feedback dual actuators wireless controller for PlayStation 5 gaming.',
        brand: brandSony._id,
        category: electronics._id,
        price: 69.99,
        suggestedPrice: 69.99,
        discountPrice: 0,
        stockQuantity: 40,
        images: ['https://images.unsplash.com/photo-1592840496694-26d035b52b48?q=80&w=500&auto=format&fit=crop'],
        rating: 4.8,
        reviewCount: 88,
        isVisible: true,
        promoLabel: 'Popular',
      },
      {
        name: 'Keychron K8 Keyboard',
        sku: 'KEYCHRONK8-TKL',
        description: 'Tenkeyless layout mechanical keyboard with hot-swappable switches, compatible with Mac and Windows.',
        brand: brandKeychron._id,
        category: electronics._id,
        price: 89.00,
        suggestedPrice: 99.00,
        discountPrice: 0,
        stockQuantity: 20,
        images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=500&auto=format&fit=crop'],
        rating: 4.6,
        reviewCount: 30,
        isVisible: true,
        promoLabel: 'New',
      },
      {
        name: 'Keychron Q1 Custom Board',
        sku: 'KEYCHRONQ1-ALUM',
        description: 'Full aluminum CNC mechanical keyboard base layout with double-gasket design, fully programmable.',
        brand: brandKeychron._id,
        category: electronics._id,
        price: 169.00,
        suggestedPrice: 179.00,
        discountPrice: 159.00,
        stockQuantity: 12,
        images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=500&auto=format&fit=crop'],
        rating: 4.9,
        reviewCount: 15,
        isVisible: true,
        promoLabel: 'Popular',
      },
      
      // FASHION
      {
        name: 'Nike Air Max 270',
        sku: 'NIKEAIRMAX-99',
        description: 'Lightweight and breathable running sneakers with large Air cushioning heel system.',
        brand: brandNike._id,
        category: fashion._id,
        price: 150.00,
        suggestedPrice: 160.00,
        discountPrice: 129.99,
        stockQuantity: 40,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop'],
        rating: 4.5,
        reviewCount: 80,
        isVisible: true,
        promoLabel: 'Sale',
      },
      {
        name: 'Nike Tech Fleece Jacket',
        sku: 'NIKETECHFLEECE-JKT',
        description: 'Premium double-sided spacer fleece hoodie matching warmth and comfort.',
        brand: brandNike._id,
        category: fashion._id,
        price: 120.00,
        suggestedPrice: 120.00,
        discountPrice: 0,
        stockQuantity: 4,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500&auto=format&fit=crop'],
        rating: 4.2,
        reviewCount: 8,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Adidas Ultraboost 22',
        sku: 'ADIDAS-ULTRABOOST22',
        description: 'Responsive cushioning running shoe with Primeknit textile upper and continental rubber outsole.',
        brand: brandAdidas._id,
        category: fashion._id,
        price: 190.00,
        suggestedPrice: 190.00,
        discountPrice: 149.00,
        stockQuantity: 28,
        images: ['https://images.unsplash.com/photo-1518002171953-a080ee81be25?q=80&w=500&auto=format&fit=crop'],
        rating: 4.6,
        reviewCount: 52,
        isVisible: true,
        promoLabel: 'Sale',
      },
      {
        name: 'Adidas Classic Hoodie',
        sku: 'ADIDAS-TREFOIL-HD',
        description: 'Iconic Trefoil logo fleece hoodie made of cozy French terry.',
        brand: brandAdidas._id,
        category: fashion._id,
        price: 70.00,
        suggestedPrice: 75.00,
        discountPrice: 59.99,
        stockQuantity: 15,
        images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=500&auto=format&fit=crop'],
        rating: 4.4,
        reviewCount: 20,
        isVisible: true,
        promoLabel: 'Popular',
      },
      {
        name: 'Nike Running Shorts',
        sku: 'NIKE-RUN-SHORTS',
        description: 'Sweat-wicking, breathable athletic shorts with integrated liner for comfort during running.',
        brand: brandNike._id,
        category: fashion._id,
        price: 35.00,
        suggestedPrice: 38.00,
        discountPrice: 29.99,
        stockQuantity: 22,
        images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=500&auto=format&fit=crop'],
        rating: 4.3,
        reviewCount: 15,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Adidas Stan Smith Sneakers',
        sku: 'ADIDAS-STAN-SMITH',
        description: 'Timeless white leather lifestyle sneakers with iconic perforated 3-Stripes detailing.',
        brand: brandAdidas._id,
        category: fashion._id,
        price: 90.00,
        suggestedPrice: 95.00,
        discountPrice: 0,
        stockQuantity: 18,
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=500&auto=format&fit=crop'],
        rating: 4.7,
        reviewCount: 33,
        isVisible: true,
        promoLabel: 'Popular',
      },
      {
        name: 'Nike Windrunner Jacket',
        sku: 'NIKE-WINDRUNNER',
        description: 'Iconic chevron panel design lightweight mesh-lined breathable running running windbreaker jacket.',
        brand: brandNike._id,
        category: fashion._id,
        price: 100.00,
        suggestedPrice: 110.00,
        discountPrice: 85.00,
        stockQuantity: 16,
        images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=500&auto=format&fit=crop'],
        rating: 4.5,
        reviewCount: 11,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Nike Club Fleece Pants',
        sku: 'NIKE-FLEECE-PANTS',
        description: 'Soft brushed fleece jogger pants with elastic cuffs, drawstring waistband.',
        brand: brandNike._id,
        category: fashion._id,
        price: 55.00,
        suggestedPrice: 55.00,
        discountPrice: 0,
        stockQuantity: 30,
        images: ['https://images.unsplash.com/photo-1515438026878-234150c2fd2f?q=80&w=500&auto=format&fit=crop'],
        rating: 4.4,
        reviewCount: 22,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Adidas Superstar Shoes',
        sku: 'ADIDAS-SUPERSTAR',
        description: 'The world-famous shell-toe lifestyle sneakers, clean white leather and black 3-Stripes.',
        brand: brandAdidas._id,
        category: fashion._id,
        price: 100.00,
        suggestedPrice: 100.00,
        discountPrice: 79.99,
        stockQuantity: 24,
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=500&auto=format&fit=crop'],
        rating: 4.8,
        reviewCount: 95,
        isVisible: true,
        promoLabel: 'Popular',
      },
      {
        name: 'Adidas Tiro Track Pants',
        sku: 'ADIDAS-TIRO-PANTS',
        description: 'Sweat-wicking track pants designed for football training and athletic street style comfort.',
        brand: brandAdidas._id,
        category: fashion._id,
        price: 50.00,
        suggestedPrice: 50.00,
        discountPrice: 39.99,
        stockQuantity: 35,
        images: ['https://images.unsplash.com/photo-1515438026878-234150c2fd2f?q=80&w=500&auto=format&fit=crop'],
        rating: 4.6,
        reviewCount: 41,
        isVisible: true,
        promoLabel: '',
      },

      // HOME & LIVING
      {
        name: 'Ikea Markus Chair',
        sku: 'IKEA-MARKUS-CHAIR',
        description: 'Ergonomic high-back office chair with breathable mesh back and adjustable tilt limits.',
        brand: brandIkea._id,
        category: home._id,
        price: 229.00,
        suggestedPrice: 249.00,
        discountPrice: 199.00,
        stockQuantity: 10,
        images: ['https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=500&auto=format&fit=crop'],
        rating: 4.3,
        reviewCount: 38,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Ikea Linnmon Desk',
        sku: 'IKEA-LINNMON-DESK',
        description: 'Simple and sturdy setup office desk with pre-drilled holes for easy leg assembly.',
        brand: brandIkea._id,
        category: home._id,
        price: 89.00,
        suggestedPrice: 99.00,
        discountPrice: 0,
        stockQuantity: 3,
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=500&auto=format&fit=crop'],
        rating: 4.1,
        reviewCount: 15,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Ikea LED Desk Lamp',
        sku: 'IKEA-LED-LAMP',
        description: 'Flexible goose-neck LED workspace lamp offering direct lighting, low power usage.',
        brand: brandIkea._id,
        category: home._id,
        price: 19.99,
        suggestedPrice: 24.99,
        discountPrice: 14.99,
        stockQuantity: 45,
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=500&auto=format&fit=crop'],
        rating: 4.5,
        reviewCount: 29,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Ikea Micke Study Desk',
        sku: 'IKEA-MICKE-DESK',
        description: 'Compact study table desk with built-in cable outlets and drawer, clean Scandinavian style.',
        brand: brandIkea._id,
        category: home._id,
        price: 99.00,
        suggestedPrice: 109.00,
        discountPrice: 89.00,
        stockQuantity: 8,
        images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=500&auto=format&fit=crop'],
        rating: 4.2,
        reviewCount: 17,
        isVisible: true,
        promoLabel: 'New',
      },
      {
        name: 'Ikea Kallax Shelf Unit',
        sku: 'IKEA-KALLAX-WHT',
        description: 'Versatile cube display shelving unit, can be placed vertically or horizontally.',
        brand: brandIkea._id,
        category: home._id,
        price: 79.99,
        suggestedPrice: 85.00,
        discountPrice: 0,
        stockQuantity: 12,
        images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=500&auto=format&fit=crop'],
        rating: 4.6,
        reviewCount: 42,
        isVisible: true,
        promoLabel: '',
      },
      {
        name: 'Ikea Lack Side Table',
        sku: 'IKEA-LACK-TAB',
        description: 'Super lightweight, easily assembled, low-profile small bedside coffee table.',
        brand: brandIkea._id,
        category: home._id,
        price: 15.00,
        suggestedPrice: 19.99,
        discountPrice: 12.50,
        stockQuantity: 60,
        images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=500&auto=format&fit=crop'],
        rating: 4.4,
        reviewCount: 50,
        isVisible: true,
        promoLabel: '',
      }
    ];

    await Product.create(products);
    console.log('Seeded Products.');

    // Seed Banners
    await Banner.create([
      {
        title: 'Tech Upgrade Season',
        subtitle: 'Get up to 20% discount on standard Apple devices',
        image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=1000&auto=format&fit=crop',
        buttonText: 'Shop Tech',
        redirectUrl: '/shop?category=' + electronics._id,
        sequence: 1,
      },
      {
        title: 'Step Into Style',
        subtitle: 'Premium Nike sportswear and sneakers collection',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1000&auto=format&fit=crop',
        buttonText: 'Shop Fashion',
        redirectUrl: '/shop?brand=' + brandNike._id,
        sequence: 2,
      }
    ]);
    console.log('Seeded Hero Banners.');

    // Seed Coupons
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await Coupon.create([
      {
        code: 'SAVE10',
        discountType: 'Percentage',
        discountValue: 10,
        startDate: new Date(),
        endDate: nextMonth,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'FLAT50',
        discountType: 'Fixed',
        discountValue: 50,
        startDate: new Date(),
        endDate: nextMonth,
        usageLimit: 50,
        usedCount: 0,
        isActive: true,
      }
    ]);
    console.log('Seeded Discount Coupons.');

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();

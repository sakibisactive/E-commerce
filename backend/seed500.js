import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import Banner from './models/Banner.js';

dotenv.config();

const TARGET_URI = 'mongodb+srv://shahriarsakib1205_db_user:DcEMyssW3VRI1ZVI@cluster0.xyxtvl5.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

const seed500 = async () => {
  try {
    console.log('Connecting to MongoDB Atlas Cluster...');
    await mongoose.connect(TARGET_URI);
    console.log('Connected successfully!');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Seed Accounts
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

    console.log('Seeded Admin and Customer Accounts.');

    // 2. Seed Categories
    const categoryDefs = [
      { name: 'Electronics', description: 'Smartphones, Laptops, Audio, Gaming and Accessories.', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop' },
      { name: 'Fashion & Apparel', description: 'Premium Apparel, Lifestyle Footwear, and activewear.', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop' },
      { name: 'Home & Living', description: 'Modern office desks, ergonomic chairs, and furniture.', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop' },
      { name: 'Gaming Gear', description: 'High-performance consoles, keyboards, mice, and VR sets.', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop' },
      { name: 'Fitness & Outdoors', description: 'Gym equipment, smart sports watches, and active gear.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop' },
      { name: 'Audio & Acoustics', description: 'Headphones, studio monitors, wireless speakers, soundbars.', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop' },
      { name: 'Photography & Cameras', description: 'Mirrorless cameras, lenses, tripods, and lighting setups.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop' },
      { name: 'Smart Home & Wearables', description: 'Smart watches, IoT home hubs, ambient LED lighting.', image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=600&auto=format&fit=crop' },
    ];

    const categories = await Category.create(categoryDefs);
    console.log(`Seeded ${categories.length} Categories.`);

    // 3. Seed Brands
    const brandDefs = [
      { name: 'Apple', logo: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=200&auto=format&fit=crop', description: 'Consumer electronics maker.' },
      { name: 'Sony', logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=200&auto=format&fit=crop', description: 'Global electronics and entertainment giant.' },
      { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format&fit=crop', description: 'Innovative displays and smart devices.' },
      { name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop', description: 'Athletic wear and footwear giant.' },
      { name: 'Adidas', logo: 'https://images.unsplash.com/photo-1518002171953-a080ee81be25?q=80&w=200&auto=format&fit=crop', description: 'Performance apparel and sneakers.' },
      { name: 'Puma', logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=200&auto=format&fit=crop', description: 'Sportstyle footwear and streetwear.' },
      { name: 'Logitech', logo: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=200&auto=format&fit=crop', description: 'PC peripherals and gaming accessories.' },
      { name: 'Razer', logo: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?q=80&w=200&auto=format&fit=crop', description: 'For Gamers. By Gamers.' },
      { name: 'Bose', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=200&auto=format&fit=crop', description: 'Premium sound technology.' },
      { name: 'Keychron', logo: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=200&auto=format&fit=crop', description: 'Custom mechanical keyboards.' },
      { name: 'Asus', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=200&auto=format&fit=crop', description: 'ROG gaming laptops and hardware.' },
      { name: 'Canon', logo: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=200&auto=format&fit=crop', description: 'Imaging and optics equipment.' },
      { name: 'Ikea', logo: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=200&auto=format&fit=crop', description: 'Scandinavian modular home furniture.' },
    ];

    const brands = await Brand.create(brandDefs);
    console.log(`Seeded ${brands.length} Brands.`);

    // High-resolution Unsplash image pools for each category
    const imagePools = {
      Electronics: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop',
      ],
      'Fashion & Apparel': [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518002171953-a080ee81be25?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
      ],
      'Home & Living': [
        'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop',
      ],
      'Gaming Gear': [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592840496694-26d035b52b48?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?q=80&w=600&auto=format&fit=crop',
      ],
      'Fitness & Outdoors': [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1576678927484-cc909957088c?q=80&w=600&auto=format&fit=crop',
      ],
      'Audio & Acoustics': [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1588449668365-d15e397f6787?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop',
      ],
      'Photography & Cameras': [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
      ],
      'Smart Home & Wearables': [
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
      ]
    };

    const adjectives = ['Pro', 'Ultra', 'Plus', 'Max', 'Edition', 'Studio', 'Elite', 'Master', 'Classic', 'Lite', 'Wireless', 'Slim', 'Smart', 'V2', 'Prime'];
    const promoLabels = ['New', 'Trending', 'Popular', 'Sale', ''];

    console.log('Generating 500 Product Records...');
    const productsToInsert = [];

    for (let i = 1; i <= 500; i++) {
      const category = categories[i % categories.length];
      const brand = brands[i % brands.length];
      const adj = adjectives[i % adjectives.length];
      const promo = promoLabels[i % promoLabels.length];
      
      const basePrice = Math.floor(Math.random() * 950) + 25;
      const hasDiscount = i % 3 === 0;
      const discountPrice = hasDiscount ? Math.floor(basePrice * 0.85) : 0;
      const suggestedPrice = Math.floor(basePrice * 1.1);

      const pool = imagePools[category.name] || imagePools['Electronics'];
      const img1 = pool[i % pool.length];
      const img2 = pool[(i + 1) % pool.length];

      const sku = `${brand.name.substring(0, 3).toUpperCase()}-${category.name.substring(0, 3).toUpperCase()}-${1000 + i}`;
      const name = `${brand.name} ${category.name.split(' ')[0]} ${adj} ${i}`;
      const description = `The premium ${name} engineered by ${brand.name}. Featuring industry-leading performance, ergonomic craftsmanship, and full warranty coverage. Designed for seamless performance in the ${category.name} ecosystem.`;

      productsToInsert.push({
        name,
        sku,
        description,
        brand: brand._id,
        category: category._id,
        price: basePrice,
        suggestedPrice,
        discountPrice,
        stockQuantity: Math.floor(Math.random() * 45) + 5,
        images: [img1, img2],
        rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 120) + 5,
        isVisible: true,
        promoLabel: promo,
      });
    }

    // Insert products in bulk batches for max performance
    const batchSize = 100;
    for (let j = 0; j < productsToInsert.length; j += batchSize) {
      const batch = productsToInsert.slice(j, j + batchSize);
      await Product.insertMany(batch);
      console.log(`Inserted batch ${j + batch.length} / 500 products...`);
    }

    console.log('Seeded 500 Products!');

    // 4. Seed Hero Banners
    await Banner.create([
      {
        title: 'Tech & Innovation Fest 2026',
        subtitle: 'Explore 500+ premium products across Electronics, Audio, and Home Gear',
        image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=1200&auto=format&fit=crop',
        buttonText: 'Explore Catalog',
        redirectUrl: '/shop',
        sequence: 1,
      },
      {
        title: 'Step Into Style & Performance',
        subtitle: 'Exclusive discounts on Nike, Adidas, Puma & Activewear',
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1200&auto=format&fit=crop',
        buttonText: 'Shop Fashion',
        redirectUrl: '/shop?category=' + categories[1]._id,
        sequence: 2,
      }
    ]);
    console.log('Seeded Hero Banners.');

    // 5. Seed Coupons
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 2);

    await Coupon.create([
      {
        code: 'SAVE10',
        discountType: 'Percentage',
        discountValue: 10,
        startDate: new Date(),
        endDate: nextMonth,
        usageLimit: 500,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'FLAT50',
        discountType: 'Fixed',
        discountValue: 50,
        startDate: new Date(),
        endDate: nextMonth,
        usageLimit: 200,
        usedCount: 0,
        isActive: true,
      }
    ]);
    console.log('Seeded Discount Coupons.');

    console.log('==================================================');
    console.log('🎉 SUCCESS: 500 Products and Database fully seeded!');
    console.log('==================================================');
    process.exit(0);
  } catch (err) {
    console.error(`Seeding Failed: ${err.message}`);
    process.exit(1);
  }
};

seed500();

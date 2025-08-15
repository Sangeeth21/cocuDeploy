
import type { DisplayProduct, Review, Category, User, FlashDeal, HeroCampaign, Order, OrderedCombo, WishlistedCombo, MarketingCampaign, CustomizationOption, CorporateBid, AiImageStyle, Program } from './types';

export const mockProducts: DisplayProduct[] = [
  {
    id: '1',
    name: 'Classic Leather Watch',
    description: 'A timeless piece that combines classic design with modern functionality. Features a genuine leather strap and a stainless steel case. Perfect for any occasion, from formal events to casual outings. Water-resistant up to 50 meters.',
    price: 199.99,
    category: 'Jewelry & Personal Accessories',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.5,
    reviewCount: 120,
    vendorId: 'VDR001',
    tags: ['watch', 'leather'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'LW-001',
    stock: 25,
    status: 'Live',
    b2bEnabled: true,
    moq: 100,
    tierPrices: [
      { quantity: 500, price: 159.99 },
      { quantity: 1000, price: 149.99 },
      { quantity: 5000, price: 139.99 },
    ],
    customizationAreas: {
      back: [
        { id: 'watch-engraving', shape: 'rect', x: 25, y: 45, width: 50, height: 10, label: 'Engraving', fontFamily: 'serif', fontSize: 10, fontWeight: 'normal', textColor: '#333333', curveIntensity: 0 },
      ]
    }
  },
  {
    id: '2',
    name: 'Wireless Bluetooth Headphones',
    description: 'Experience immersive sound with these noise-cancelling wireless headphones. Up to 30 hours of battery life on a single charge. Connects seamlessly to all your devices. Includes a carrying case.',
    price: 149.50,
    category: 'Phone & Tech Accessories',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.8,
    reviewCount: 350,
    vendorId: 'VDR002',
    tags: ['headphones', 'audio'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'HP-202',
    stock: 50,
    status: 'Live',
    b2bEnabled: true,
    moq: 50,
    tierPrices: [
      { quantity: 200, price: 119.99 },
      { quantity: 500, price: 109.99 },
    ],
    customizationAreas: {
      right: [
        { id: 'headphone-logo', shape: 'rect', x: 40, y: 40, width: 20, height: 20, label: 'Logo', fontFamily: 'sans-serif', fontSize: 14, fontWeight: 'bold', textColor: '#FFFFFF', curveIntensity: 0 },
      ]
    }
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Made from 100% GOTS certified organic cotton, this t-shirt is both comfortable and sustainable. A wardrobe essential with a classic fit. Available in various colors.',
    price: 29.99,
    category: 'Custom Apparel',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.2,
    reviewCount: 85,
    vendorId: 'VDR003',
    tags: ['t-shirt', 'organic'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'TS-ORG-M',
    stock: 150,
    status: 'Archived',
    b2bEnabled: true,
    moq: 250,
    tierPrices: [
      { quantity: 1000, price: 19.99 },
      { quantity: 5000, price: 15.99 },
    ],
    customizationAreas: {
      front: [
        { id: 'front-text', shape: 'rect', x: 25, y: 40, width: 50, height: 20, label: 'Front Text', fontFamily: 'sans-serif', fontSize: 16, fontWeight: 'bold', textColor: '#000000', curveIntensity: 0 },
      ],
      back: [
         { id: 'back-text', shape: 'rect', x: 25, y: 70, width: 50, height: 10, label: 'Back Text', fontFamily: 'monospace', fontSize: 12, fontWeight: 'normal', textColor: '#333333', curveIntensity: 0 },
      ]
    }
  },
  {
    id: '4',
    name: 'Handcrafted Ceramic Mug',
    description: 'Start your day with a beautiful, handcrafted ceramic mug. Each piece is unique, with subtle variations in color and texture. Microwave and dishwasher safe. Holds 12 oz.',
    price: 24.00,
    category: 'Drinkware & Tumblers',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.9,
    reviewCount: 215,
    vendorId: 'VDR004',
    tags: ['mug', 'ceramic'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'CM-HND-BL',
    stock: 8,
    status: 'Live',
    b2bEnabled: true,
    moq: 200,
    tierPrices: [
      { quantity: 1000, price: 15.99 },
      { quantity: 5000, price: 12.99 },
    ],
    customizationAreas: {
      front: [
         { id: 'mug-text', shape: 'ellipse', x: 15, y: 35, width: 70, height: 30, label: 'Your Name', fontFamily: 'serif', fontSize: 18, fontWeight: 'normal', textColor: '#FFFFFF', curveIntensity: 30 },
      ]
    }
  },
  {
    id: '5',
    name: 'Gourmet Coffee Beans',
    description: 'A rich and aromatic blend of single-origin Arabica beans from the highlands of Colombia. Medium roast with notes of chocolate and citrus. Whole bean, 12 oz bag.',
    price: 18.99,
    category: 'Food & Beverage Gifts',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.7,
    reviewCount: 412,
    vendorId: 'VDR005',
    tags: ['coffee', 'beans'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'CB-COL-12',
    stock: 0,
    status: 'Archived',
    b2bEnabled: false,
  },
  {
    id: '6',
    name: 'Professional Yoga Mat',
    description: 'This non-slip, eco-friendly yoga mat provides the perfect cushioning and stability for your practice. Made from natural tree rubber. Includes a carrying strap.',
    price: 79.99,
    category: 'Outdoor & Lifestyle',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.6,
    reviewCount: 198,
    vendorId: 'VDR006',
    tags: ['yoga', 'fitness'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'YM-PRO-BLK',
    stock: 35,
    status: 'Needs Review',
    b2bEnabled: true,
    moq: 100,
    tierPrices: [
        { quantity: 500, price: 59.99 },
        { quantity: 1000, price: 54.99 },
    ],
    customizationAreas: {
      top: [
        { id: 'mat-corner-logo', shape: 'rect', x: 85, y: 85, width: 10, height: 10, label: 'Logo', fontFamily: 'sans-serif', fontSize: 8, fontWeight: 'bold', textColor: '#333333', curveIntensity: 0 },
      ]
    }
  },
  {
    id: '7',
    name: 'Modern Minimalist Desk',
    description: 'A sleek and stylish desk that fits perfectly in any modern workspace. Features a durable oak top and sturdy steel legs. Easy assembly required.',
    price: 349.00,
    category: 'Stationery & Office Supplies',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.4,
    reviewCount: 55,
    vendorId: 'VDR007',
    tags: ['desk', 'furniture'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'DSK-MIN-OAK',
    stock: 12,
    status: 'Live',
    b2bEnabled: false,
  },
  {
    id: '8',
    name: 'All-Natural Skincare Set',
    description: 'Rejuvenate your skin with this set of all-natural skincare products, including a cleanser, toner, and moisturizer. Vegan and cruelty-free. Suitable for all skin types.',
    price: 89.99,
    category: 'Wellness & Self-Care',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.8,
    reviewCount: 289,
    vendorId: 'VDR008',
    tags: ['skincare', 'beauty'],
    images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x400.png', 'https://placehold.co/400x600.png'],
    sku: 'SKN-SET-NAT',
    stock: 40,
    status: 'Live',
    b2bEnabled: true,
    moq: 50,
    tierPrices: [
        { quantity: 250, price: 69.99 },
        { quantity: 500, price: 64.99 },
    ],
  },
  {
    id: '9',
    name: 'Hand-poured Soy Candle',
    description: 'A beautiful soy wax candle in a reusable glass jar. Lavender and vanilla scent. 40+ hour burn time.',
    price: 22.50,
    category: 'Home & Décor',
    imageUrl: 'https://placehold.co/600x600.png',
    rating: 4.9,
    reviewCount: 150,
    vendorId: 'VDR004',
    tags: ['candle', 'home'],
    images: ['https://placehold.co/600x600.png'],
    sku: 'CNDL-SOY-LV',
    stock: 60,
    status: 'Live',
    b2bEnabled: true,
    moq: 300,
    tierPrices: [
        { quantity: 1000, price: 14.99 },
        { quantity: 5000, price: 11.99 },
    ],
    customizationAreas: {
      front: [
        { id: 'candle-label', shape: 'rect', x: 20, y: 40, width: 60, height: 20, label: 'Custom Label', fontFamily: 'serif', fontSize: 14, fontWeight: 'normal', textColor: '#000000', curveIntensity: 0 },
      ]
    }
  },
];

export const mockReviews: Review[] = [
    { id: 'REV001', productId: '1', author: 'Jane D.', avatarUrl: 'https://placehold.co/40x40.png', rating: 5, title: 'Absolutely love it!', comment: 'This is the best purchase I have made this year. The quality is outstanding and it looks even better in person.', date: '2024-05-15' },
    { id: 'REV002', productId: '1', author: 'John S.', avatarUrl: 'https://placehold.co/40x40.png', rating: 4, title: 'Pretty good', comment: 'Solid product, works as advertised. The packaging was a bit flimsy but the product itself is great.', date: '2024-05-12' },
    { id: 'REV003', productId: '2', author: 'Emily R.', avatarUrl: 'https://placehold.co/40x40.png', rating: 5, title: 'Exceeded my expectations', comment: 'I was hesitant at first but I am so glad I bought it. Highly recommended!', date: '2024-05-10' },
    { id: 'REV004', productId: '2', author: 'Mike T.', avatarUrl: 'https://placehold.co/40x40.png', rating: 3, title: 'It\'s okay', comment: 'Does the job, but it feels a bit overpriced for what it is. Not bad, but not amazing either.', date: '2024-05-08' },
];

export const mockCategories: Category[] = [
    { name: 'Custom Apparel', imageUrl: 'https://placehold.co/400x300.png', productCount: 320 },
    { name: 'Drinkware & Tumblers', imageUrl: 'https://placehold.co/400x300.png', productCount: 210 },
    { name: 'Phone & Tech Accessories', imageUrl: 'https://placehold.co/400x300.png', productCount: 150 },
    { name: 'Bags & Totes', imageUrl: 'https://placehold.co/400x300.png', productCount: 140 },
    { name: 'Home & Décor', imageUrl: 'https://placehold.co/400x300.png', productCount: 180 },
    { name: 'Stationery & Office Supplies', imageUrl: 'https://placehold.co/400x300.png', productCount: 250 },
    { name: 'Jewelry & Personal Accessories', imageUrl: 'https://placehold.co/400x300.png', productCount: 110 },
    { name: 'Events & Occasions', imageUrl: 'https://placehold.co/400x300.png', productCount: 90 },
    { name: 'Corporate Gift Kits', imageUrl: 'https://placehold.co/400x300.png', productCount: 50 },
    { name: 'Outdoor & Lifestyle', imageUrl: 'https://placehold.co/400x300.png', productCount: 120 },
    { name: 'Premium & Specialty Finishes', imageUrl: 'https://placehold.co/400x300.png', productCount: 75 },
    { name: 'Wellness & Self-Care', imageUrl: 'https://placehold.co/400x300.png', productCount: 85 },
    { name: 'Food & Beverage Gifts', imageUrl: 'https://placehold.co/400x300.png', productCount: 65 },
];

export const customizationOptions: CustomizationOption[] = [
  // Printing
  { id: 'screen-printing', label: 'Screen Printing' },
  { id: 'digital-printing', label: 'Digital Printing (DTG)' },
  { id: 'sublimation', label: 'Sublimation' },
  { id: 'uv-printing', label: 'UV Printing' },
  { id: 'vinyl-transfer', label: 'Heat Transfer Vinyl (HTV)' },
  // Stitching & Fabric
  { id: 'embroidery', label: 'Embroidery' },
  { id: 'patch-sewing', label: 'Patch Sewing' },
  // Material Alteration
  { id: 'laser-engraving', label: 'Laser Engraving' },
  { id: 'debossing', label: 'Debossing / Embossing' },
  { id: 'foil-stamping', label: 'Foil Stamping' },
  // Photo
  { id: 'photo-printing', label: 'Photo Printing' },
  { id: 'photo-etching', label: 'Photo Etching' },
];

export const categoryCustomizationMap: { [key: string]: string[] } = {
    'Custom Apparel': ['screen-printing', 'digital-printing', 'embroidery', 'vinyl-transfer', 'sublimation', 'patch-sewing'],
    'Drinkware & Tumblers': ['screen-printing', 'laser-engraving', 'sublimation', 'uv-printing', 'photo-printing'],
    'Phone & Tech Accessories': ['uv-printing', 'laser-engraving', 'screen-printing', 'debossing'],
    'Bags & Totes': ['screen-printing', 'embroidery', 'vinyl-transfer', 'patch-sewing'],
    'Home & Décor': ['laser-engraving', 'sublimation', 'embroidery', 'uv-printing', 'photo-printing', 'photo-etching'],
    'Stationery & Office Supplies': ['screen-printing', 'laser-engraving', 'uv-printing', 'debossing', 'foil-stamping'],
    'Jewelry & Personal Accessories': ['laser-engraving', 'debossing', 'photo-etching', 'foil-stamping'],
    'Events & Occasions': ['screen-printing', 'digital-printing', 'laser-engraving', 'foil-stamping'],
    'Corporate Gift Kits': ['screen-printing', 'embroidery', 'laser-engraving', 'uv-printing', 'debossing', 'foil-stamping'],
    'Outdoor & Lifestyle': ['screen-printing', 'laser-engraving', 'embroidery', 'patch-sewing'],
    'Premium & Specialty Finishes': ['laser-engraving', 'debossing', 'foil-stamping', 'photo-etching'],
    'Wellness & Self-Care': ['uv-printing', 'screen-printing', 'laser-engraving', 'embroidery', 'debossing'],
    'Food & Beverage Gifts': ['debossing', 'uv-printing', 'screen-printing', 'foil-stamping', 'laser-engraving']
};

export const mockUsers: User[] = [
    { 
        id: 'USR001', 
        name: 'Olivia Martin', 
        email: 'customer@example.com', 
        role: 'Customer', 
        status: 'Active', 
        joinedDate: '2024-01-15', 
        avatar: 'https://placehold.co/40x40.png',
        loyalty: {
            referralCode: "OLIVIA-M-REF",
            referrals: 2,
            referralsForNextTier: 5,
            walletBalance: 25.50,
            ordersToNextReward: 1,
            totalOrdersForReward: 3,
            loyaltyPoints: 5280,
            loyaltyTier: 'Bronze',
            nextLoyaltyTier: 'Silver',
            pointsToNextTier: 7500,
        }
    },
    { id: 'VDR001', name: 'Timeless Co.', email: 'vendor@example.com', role: 'Vendor', status: 'Active', joinedDate: '2024-02-20', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR003', name: 'Jackson Lee', email: 'jackson.lee@email.com', role: 'Customer', status: 'Active', joinedDate: '2024-03-10', avatar: 'https://placehold.co/40x40.png' },
    { id: 'VDR002', name: 'Crafty Creations', email: 'crafty@example.com', role: 'Vendor', status: 'Suspended', joinedDate: '2024-03-15', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR005', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', role: 'Customer', status: 'Active', joinedDate: '2024-04-05', avatar: 'https://placehold.co/40x40.png' },
    { id: 'VDR003', name: 'Gadget Guru', email: 'gadget@example.com', role: 'Vendor', status: 'Active', joinedDate: '2024-04-22', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR007', name: 'William Kim', email: 'will@email.com', role: 'Customer', status: 'Active', joinedDate: '2024-05-30', avatar: 'https://placehold.co/40x40.png' },
    { id: 'VDR004', name: 'HomeBody Decor', email: 'home@example.com', role: 'Vendor', status: 'Active', joinedDate: '2024-06-01', avatar: 'https://placehold.co/40x40.png' },
];

export const mockOrders: Order[] = [
    {
        id: "ORD001",
        date: new Date("2024-06-20"),
        customer: mockUsers[0],
        items: [
            { productId: '1', productName: 'Classic Leather Watch', productImage: mockProducts[0].imageUrl, quantity: 1, price: 199.99 },
            { productId: '3', productName: 'Organic Cotton T-Shirt', productImage: mockProducts[2].imageUrl, quantity: 2, price: 29.99 }
        ],
        total: 259.97,
        subtotal: 259.97,
        shipping: 0,
        status: "Delivered",
        shippingAddress: { recipient: 'Olivia Martin', line1: '123 Main St', city: 'Anytown', zip: '12345' },
        payment: { method: 'Visa', last4: '4242' }
    },
    {
        id: "ORD002",
        date: new Date("2024-06-18"),
        customer: mockUsers[2],
        items: [
            { productId: '2', productName: 'Wireless Bluetooth Headphones', productImage: mockProducts[1].imageUrl, quantity: 1, price: 149.50 }
        ],
        total: 149.50,
        subtotal: 149.50,
        shipping: 0,
        status: "Shipped",
        shippingAddress: { recipient: 'Jackson Lee', line1: '456 Oak Ave', city: 'Someville', zip: '67890' },
        payment: { method: 'Mastercard', last4: '5555' }
    },
    {
        id: "ORD003",
        date: new Date("2024-06-15"),
        customer: mockUsers[4],
        items: [
            { productId: '7', productName: 'Modern Minimalist Desk', productImage: mockProducts[6].imageUrl, quantity: 1, price: 349.00 },
             { productId: '4', productName: 'Handcrafted Ceramic Mug', productImage: mockProducts[3].imageUrl, quantity: 4, price: 24.00 }
        ],
        total: 445.00,
        subtotal: 445.00,
        shipping: 0,
        status: "Processing",
        shippingAddress: { recipient: 'Isabella Nguyen', line1: '789 Pine Ln', city: 'Metropolis', zip: '10111' },
        payment: { method: 'Visa', last4: '1111' }
    },
    {
        id: "ORD004",
        date: new Date("2024-06-12"),
        customer: mockUsers[6],
        items: [
            { productId: '8', productName: 'All-Natural Skincare Set', productImage: mockProducts[7].imageUrl, quantity: 1, price: 89.99 }
        ],
        total: 89.99,
        subtotal: 89.99,
        shipping: 0,
        status: "Pending",
        shippingAddress: { recipient: 'William Kim', line1: '321 Maple Dr', city: 'Townsburgh', zip: '22233' },
        payment: { method: 'PayPal', last4: 'N/A' }
    },
    {
        id: "ORD005",
        date: new Date("2024-06-10"),
        customer: mockUsers[0],
        items: [
            { productId: '9', productName: 'Hand-poured Soy Candle', productImage: mockProducts[8].imageUrl, quantity: 3, price: 22.50 }
        ],
        total: 67.50,
        subtotal: 67.50,
        shipping: 0,
        status: "Cancelled",
        shippingAddress: { recipient: 'Olivia Martin', line1: '123 Main St', city: 'Anytown', zip: '12345' },
        payment: { method: 'Visa', last4: '4242' }
    }
];

export const mockUserOrders = [
    { id: "ORD001", date: "2024-05-20", status: "Delivered", total: 49.99 },
    { id: "ORD002", date: "2024-06-11", status: "Shipped", total: 124.50 },
    { id: "ORD003", date: "2024-06-15", status: "Processing", total: 79.99 },
];


export const mockNotifications = [
    // For Admin
    { forAdmin: true, type: 'user_report', text: 'User "Crafty Creations" reported for inappropriate language', timestamp: new Date(Date.now() - 3600000), href: '/admin/moderation', actions: [{label: "Warn User", variant: "destructive"}, {label: "Dismiss", variant: "outline"}] },
    { forAdmin: true, type: 'new_vendor', text: 'New vendor "HomeBody Decor" signed up', timestamp: new Date(Date.now() - 8 * 3600000), href: '/admin/users?role=vendor' },
    // For Vendor
    { vendorId: 'VDR001', type: 'order', text: 'New order #ORD004 for $215.00', timestamp: new Date(Date.now() - 1800000), href: '/vendor/orders' },
    { vendorId: 'VDR001', type: 'message', text: 'New message from CUST001 about "Classic Leather Watch"', timestamp: new Date(Date.now() - 7200000), href: '/vendor/messages', actions: [{label: "Reply", href: "/vendor/messages"}] },
    { vendorId: 'VDR001', type: 'stock', text: '"Handcrafted Ceramic Mug" is low on stock (8 left)', timestamp: new Date(Date.now() - 86400000), href: '/vendor/inventory' },
    // For Customer
    { customerId: 'USR001', type: 'order_shipped', text: 'Your order #ORD002 has shipped!', timestamp: new Date(Date.now() - 86400000), href: '/account?tab=orders', actions: [{label: 'Track', href: '/account?tab=orders'}] },
    { customerId: 'USR001', type: 'request_approved', text: 'Your request for "Classic Leather Watch" was approved!', timestamp: new Date(Date.now() - 2 * 86400000), href: '/cart', actions: [{label: 'Go to Cart', href: '/cart'}] },
];

export const mockMarketingCampaigns: MarketingCampaign[] = [
    {
        id: "CAMP001",
        name: "Summer Sale 2024",
        type: "Sale",
        status: "Active",
        startDate: "2024-06-01",
        endDate: "2024-08-30",
        placement: "hero",
        creatives: [{
            id: 1,
            title: "Summer Collection is Here!",
            description: "Fresh looks for sunny days. Explore our new arrivals in apparel and accessories.",
            cta: "Shop Now",
            imageUrl: "https://placehold.co/1920x1080.png",
        }]
    },
    {
        id: "CAMP002",
        name: "New Electronics Launch",
        type: "Promotion",
        status: "Active",
        startDate: "2024-06-15",
        endDate: "2024-07-30",
        placement: "hero",
        creatives: [{
            id: 1,
            title: "Upgrade Your Workspace",
            description: "Find the perfect gear to boost your productivity. Desks, chairs, and tech gadgets.",
            cta: "Explore Home Office",
            imageUrl: "https://placehold.co/1920x1080.png",
        }]
    },
     {
        id: "CAMP003",
        name: "Weekend Flash Deals",
        type: "Flash Sale",
        status: "Active",
        startDate: "2024-06-22",
        endDate: "2024-08-23",
        placement: "banner",
        showCountdown: true,
        countdownPlacement: 'independent',
        timerDetails: {
            placement: 'top-banner',
            title: "Weekend Flash Sale!",
            description: "Up to 50% off select items. Ends Sunday!",
            ctaLink: "/products?tags=flash-sale"
        },
        creatives: [{
            id: 1,
            title: "Flash Sale!",
            description: "Up to 50% off select items. Ends Sunday!",
            cta: "Shop Deals",
            imageUrl: null,
        }]
    },
    {
        id: "CAMP004",
        name: "Holiday Freebies",
        type: "Freebie",
        status: "Finished",
        startDate: "2023-12-15",
        endDate: "2023-12-25",
    },
     {
        id: "CAMP005",
        name: "Draft Campaign",
        type: "Sale",
        status: "Draft",
        startDate: "2024-08-01",
        endDate: "2024-08-31",
    },
    {
        id: "CAMP006",
        name: "Back to School",
        type: "Sale",
        status: "Active",
        startDate: "2024-08-01",
        endDate: "2024-08-31",
        placement: "popup",
        creatives: [{
            id: 1,
            title: "Back to School Savings!",
            description: "Get everything you need for the new school year.",
            cta: "Shop Now",
            imageUrl: "https://placehold.co/600x400.png"
        }]
    },
     {
        id: "CAMP007",
        name: "Home Goods Special",
        type: "Promotion",
        status: "Active",
        startDate: "2024-08-01",
        endDate: "2024-08-31",
        placement: "inline-banner",
        creatives: [{
            id: 1,
            title: "Cozy Up Your Home",
            description: "Save on home goods and decor.",
            cta: "Shop Home",
            imageUrl: "https://placehold.co/1200x500.png"
        }]
    },
    {
        id: "CAMP008",
        name: "Product Page Promo",
        type: "Promotion",
        status: "Active",
        startDate: "2024-08-01",
        endDate: "2024-08-31",
        placement: "product-page-banner",
        creatives: [{
            id: 1,
            title: "Bundle & Save!",
            description: "Buy this item with a leather strap and get 20% off!",
            cta: "View Bundle",
            imageUrl: "https://placehold.co/400x400.png",
        }]
    },
]

export const mockCorporateCampaigns: MarketingCampaign[] = [
    {
        id: "CORP_CAMP001",
        name: "Q3 Bulk Discount Drive",
        type: "Sale",
        status: "Active",
        startDate: "2024-07-01",
        endDate: "2024-09-30",
        placement: "hero",
        creatives: [{
            id: 1,
            title: "Equip Your Team for Success",
            description: "Bulk discounts on premium office supplies and tech accessories. Get a custom quote today.",
            cta: "Browse Corporate Gifts",
            imageUrl: "https://placehold.co/1920x1080.png",
        }]
    },
];

export const mockCampaigns: MarketingCampaign[] = [...mockMarketingCampaigns.filter(c => c.id.startsWith("CAMP"))];

export const mockCorporateBids: CorporateBid[] = [
    {
        id: 'B2XJ5K1M',
        customerId: 'CORP001',
        products: [mockProducts[0], mockProducts[3]],
        quantity: 250,
        status: 'Active',
        createdAt: new Date('2024-07-22'),
        expiresAt: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 2 days
        responses: [
            { alias: 'Vendor A', vendorId: 'VDR001', vendorName: 'Timeless Co.', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 165.00, estimatedDelivery: '10 business days' },
            { alias: 'Vendor B', vendorId: 'VDR004', vendorName: 'Crafty Creations', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 170.50, estimatedDelivery: '8 business days', notes: 'We can offer a faster turnaround if needed.' },
        ]
    },
    {
        id: 'A9S3H7F2',
        customerId: 'CORP002',
        products: [mockProducts[1]],
        quantity: 100,
        status: 'Expired',
        createdAt: new Date('2024-07-20'),
        expiresAt: '2024-07-22T12:00:00Z',
        responses: [
            { alias: 'Vendor C', vendorId: 'VDR002', vendorName: 'Gadget Guru', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 120.00, estimatedDelivery: '5 business days' },
        ]
    },
     {
        id: 'P4G8R2T9',
        customerId: 'CORP001',
        products: [mockProducts[8], mockProducts[4]],
        quantity: 500,
        status: 'Awarded',
        createdAt: new Date('2024-07-18'),
        expiresAt: '2024-07-20T10:00:00Z',
        awardedTo: 'VDR004',
        responses: [
             { alias: 'Vendor D', vendorId: 'VDR004', vendorName: 'Crafty Creations', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 18.50, estimatedDelivery: '12 business days' },
        ]
    }
]

export const mockAiImageStyles: AiImageStyle[] = [
  // Both
  { id: 'style-1', name: 'Watercolor', backendPrompt: ', watercolor painting, soft edges, paper texture, vibrant, artistic', target: 'both', order: 1 },
  { id: 'style-2', name: 'Vintage Photo', backendPrompt: ', vintage photo, 1950s, grainy film, sepia tone, nostalgic', target: 'both', order: 2 },
  { id: 'style-3', name: 'Futuristic', backendPrompt: ', futuristic, cyberpunk, neon lights, 8k, hyper-detailed, sci-fi', target: 'both', order: 3 },

  // Personalized
  { id: 'style-4', name: 'Ghibli Style', backendPrompt: ', ghibli style anime, painted, whimsical, detailed background, atmospheric lighting', target: 'personalized', order: 4 },
  { id: 'style-5', name: '3D Claymation', backendPrompt: ', 3d claymation style, miniature, stop motion, handcrafted, soft lighting', target: 'personalized', order: 5 },
  { id: 'style-6', name: 'Vintage Comic', backendPrompt: ', vintage comic book style, pop art, halftone dots, bold lines, 1960s', target: 'personalized', order: 6 },
  { id: 'style-7', name: 'Abstract Oil Painting', backendPrompt: ', abstract oil painting, thick impasto, expressive brushstrokes, vibrant colors, artistic', target: 'personalized', order: 7 },
  { id: 'style-8', name: 'Pixel Art', backendPrompt: ', 16-bit pixel art, detailed, retro video game style, vibrant palette', target: 'personalized', order: 8 },

  // Corporate
  { id: 'style-9', name: 'Minimalist Product Shot', backendPrompt: ', minimalist product photography, clean background, simple, elegant, studio lighting, soft shadows', target: 'corporate', order: 4 },
  { id: 'style-10', name: 'Architectural Sketch', backendPrompt: ', architectural sketch, detailed line work, pencil drawing, professional, blueprint style', target: 'corporate', order: 5 },
  { id: 'style-11', name: 'Infographic Style', backendPrompt: ', modern infographic style, clean vector art, flat design, isometric perspective, corporate branding', target: 'corporate', order: 6 },
  { id: 'style-12', name: 'Double Exposure', backendPrompt: ', double exposure effect, silhouette combined with a landscape, artistic, thoughtful, professional', target: 'corporate', order: 7 },
];

export const mockPrograms: Omit<Program, 'id'>[] = [
    {
        name: "Welcome Bonus",
        target: "customer",
        type: "milestone",
        reward: { type: "wallet_credit", value: 500 },
        productScope: 'all',
        status: 'Active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        expiryDays: 90
    },
     {
        name: "Vendor Referral",
        target: "vendor",
        type: "referral",
        reward: { type: "commission_discount", value: 1 },
        productScope: 'all',
        status: 'Active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
    }
]

export const mockActivity = [
    { id: 'ACT001', type: 'order', text: 'New order #ORD004 for $215.00', time: '30m ago', href: '/admin/orders' },
    { id: 'ACT002', type: 'message', text: 'New message from CUST001 about "Classic Leather Watch"', time: '2h ago', href: '/admin/chat-logs', actions: [{label: "Reply", href: "/admin/chat-logs"}] },
    { id: 'ACT003', type: 'new_vendor', text: 'New vendor "HomeBody Decor" signed up', time: '8h ago', href: '/admin/vendors' },
    { id: 'ACT004', type: 'user_report', text: 'User "Crafty Creations" reported for inappropriate language', time: '1d ago', href: '/admin/moderation', variant: 'destructive', actions: [{label: "Warn User", variant: "destructive"}, {label: "Dismiss", variant: "outline"}] },
    { id: 'ACT005', type: 'stock', text: '"Handcrafted Ceramic Mug" is low on stock (8 left)', time: '1d ago', href: '/admin/products' },
];

export const mockVendorActivity = [
    { id: 'VACT001', type: 'order', text: 'New order #ORD004 for $215.00', time: '30m ago', href: '/vendor/orders' },
    { id: 'VACT002', type: 'message', text: 'New message from CUST001 about "Classic Leather Watch"', time: '2h ago', href: '/vendor/messages', actions: [{label: "Reply", href: "/vendor/messages"}] },
    { id: 'VACT003', type: 'confirmation', text: 'Customer is requesting "Modern Minimalist Desk"', time: '3h ago', href: '/vendor/orders' },
    { id: 'VACT004', type: 'stock', text: '"Handcrafted Ceramic Mug" is low on stock (8 left)', time: '1d ago', href: '/vendor/inventory' },
];

export const mockCorporateActivity = [
    { id: 'CACT001', type: 'order', text: 'Your bulk order #CORP001 has shipped', time: '1d ago', href: '/corporate/orders' },
    { id: 'CACT002', type: 'message', text: 'New message from Timeless Co. regarding Bid B2XJ5K1M', time: '3h ago', href: '/corporate/bids/B2XJ5K1M' },
    { id: 'CACT003', type: 'bid_response', text: 'New bid received for request B2XJ5K1M', time: '1h ago', href: '/corporate/bids/B2XJ5K1M' },
];

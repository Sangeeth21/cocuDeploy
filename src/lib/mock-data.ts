

import type { DisplayProduct, Review, Category, User, FlashDeal, HeroCampaign, Order, OrderedCombo, WishlistedCombo, MarketingCampaign, CustomizationOption, CorporateBid } from './types';

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
    { id: '1', author: 'Jane D.', avatarUrl: 'https://placehold.co/40x40.png', rating: 5, title: 'Absolutely love it!', comment: 'This is the best purchase I have made this year. The quality is outstanding and it looks even better in person.', date: '2024-05-15' },
    { id: '2', author: 'John S.', avatarUrl: 'https://placehold.co/40x40.png', rating: 4, title: 'Pretty good', comment: 'Solid product, works as advertised. The packaging was a bit flimsy but the product itself is great.', date: '2024-05-12' },
    { id: '3', author: 'Emily R.', avatarUrl: 'https://placehold.co/40x40.png', rating: 5, title: 'Exceeded my expectations', comment: 'I was hesitant at first but I am so glad I bought it. Highly recommended!', date: '2024-05-10' },
    { id: '4', author: 'Mike T.', avatarUrl: 'https://placehold.co/40x40.png', rating: 3, title: 'It\'s okay', comment: 'Does the job, but it feels a bit overpriced for what it is. Not bad, but not amazing either.', date: '2024-05-08' },
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
    { id: 'USR001', name: 'Olivia Martin', email: 'olivia.martin@email.com', role: 'Customer', status: 'Active', joinedDate: '2024-01-15', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR002', name: 'Timeless Co.', email: 'contact@timeless.co', role: 'Vendor', status: 'Active', joinedDate: '2024-02-20', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR003', name: 'Jackson Lee', email: 'jackson.lee@email.com', role: 'Customer', status: 'Active', joinedDate: '2024-03-10', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR004', name: 'Crafty Creations', email: 'hello@crafty.com', role: 'Vendor', status: 'Suspended', joinedDate: '2024-03-15', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR005', name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', role: 'Customer', status: 'Active', joinedDate: '2024-04-05', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR006', name: 'Gadget Guru', email: 'support@gadgetguru.io', role: 'Vendor', status: 'Active', joinedDate: '2024-04-22', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR007', name: 'William Kim', email: 'will@email.com', role: 'Customer', status: 'Active', joinedDate: '2024-05-30', avatar: 'https://placehold.co/40x40.png' },
    { id: 'USR008', name: 'HomeBody Decor', email: 'sales@homebody.com', role: 'Vendor', status: 'Active', joinedDate: '2024-06-01', avatar: 'https://placehold.co/40x40.png' },
];

export const mockOrders: Order[] = [
    {
        id: "ORD001",
        date: "2024-06-20",
        customer: mockUsers[0],
        items: [
            { productId: '1', productName: 'Classic Leather Watch', productImage: mockProducts[0].imageUrl, quantity: 1, price: 199.99 },
            { productId: '3', productName: 'Organic Cotton T-Shirt', productImage: mockProducts[2].imageUrl, quantity: 2, price: 29.99 }
        ],
        total: 259.97,
        status: "Delivered",
        shippingAddress: { recipient: 'Olivia Martin', line1: '123 Main St', city: 'Anytown', zip: '12345' },
        payment: { method: 'Visa', last4: '4242' }
    },
    {
        id: "ORD002",
        date: "2024-06-18",
        customer: mockUsers[2],
        items: [
            { productId: '2', productName: 'Wireless Bluetooth Headphones', productImage: mockProducts[1].imageUrl, quantity: 1, price: 149.50 }
        ],
        total: 149.50,
        status: "Shipped",
        shippingAddress: { recipient: 'Jackson Lee', line1: '456 Oak Ave', city: 'Someville', zip: '67890' },
        payment: { method: 'Mastercard', last4: '5555' }
    },
    {
        id: "ORD003",
        date: "2024-06-15",
        customer: mockUsers[4],
        items: [
            { productId: '7', productName: 'Modern Minimalist Desk', productImage: mockProducts[6].imageUrl, quantity: 1, price: 349.00 },
             { productId: '4', productName: 'Handcrafted Ceramic Mug', productImage: mockProducts[3].imageUrl, quantity: 4, price: 24.00 }
        ],
        total: 445.00,
        status: "Processing",
        shippingAddress: { recipient: 'Isabella Nguyen', line1: '789 Pine Ln', city: 'Metropolis', zip: '10111' },
        payment: { method: 'Visa', last4: '1111' }
    },
    {
        id: "ORD004",
        date: "2024-06-12",
        customer: mockUsers[6],
        items: [
            { productId: '8', productName: 'All-Natural Skincare Set', productImage: mockProducts[7].imageUrl, quantity: 1, price: 89.99 }
        ],
        total: 89.99,
        status: "Pending",
        shippingAddress: { recipient: 'William Kim', line1: '321 Maple Dr', city: 'Townsburgh', zip: '22233' },
        payment: { method: 'PayPal', last4: 'N/A' }
    },
    {
        id: "ORD005",
        date: "2024-06-10",
        customer: mockUsers[0],
        items: [
            { productId: '9', productName: 'Hand-poured Soy Candle', productImage: mockProducts[8].imageUrl, quantity: 3, price: 22.50 }
        ],
        total: 67.50,
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


export const mockVendorActivity = [
    { type: 'order', id: 'ORD004', text: 'New order #ORD004 from CUST004 for $215.00', time: '30m ago', href: '/vendor/orders' },
    { type: 'message', id: 'MSG012', text: 'New message from CUST001 about "Classic Leather Watch"', time: '2h ago', href: '/vendor/messages', actions: [{label: "Reply", href: "/vendor/messages"}] },
    { type: 'stock', id: 'CM-HND-BL', text: '"Handcrafted Ceramic Mug" is low on stock (8 left)', time: '1d ago', href: '/vendor/inventory' },
    { type: 'confirmation', id: 'REQ001', text: 'Confirmation requested for "Professional Yoga Mat"', time: '2d ago', href: '/vendor/orders', actions: [{label: "Approve"}, {label: "Reject", variant: "destructive"}] },
];

export const mockActivity = [
    { type: 'user_report', id: 'REP003', text: 'User "Crafty Creations" reported for inappropriate language', time: '1h ago', href: '/admin/moderation', actions: [{label: "Warn User", variant: "destructive"}, {label: "Dismiss", variant: "outline"}] },
    { type: 'product_review', id: 'PROD006', text: 'Product needs pricing review', time: '3h ago', href: '/admin/smart-pricing?productId=6' },
    { type: 'new_vendor', id: 'USR008', text: 'New vendor "HomeBody Decor" signed up', time: '8h ago', href: '/admin/vendors' },
    { type: 'confirmation_request', id: 'REQ001', text: 'Confirmation needed for "Professional Yoga Mat"', time: '1d ago', href: '/admin/orders' },
];

export const mockCorporateActivity = [
    { type: 'order_shipped', id: 'CORP_ORD001', text: 'Your bulk order #CORP_ORD001 has shipped!', time: '1d ago', href: '/corporate/orders', actions: [{label: 'Track Shipment', href: '/corporate/orders'}] },
    { type: 'request_approved', id: 'QUOTE005', text: 'Your quote request for "Custom Logo T-Shirts" has been approved.', time: '2d ago', href: '/corporate/quotes', actions: [{label: 'View Quote', href: '/corporate/quotes'}] },
];


// Mock data for the new marketing features
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 3);

export const mockCampaigns: MarketingCampaign[] = [
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
    }
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
    {
        id: "CORP_CAMP002",
        name: "Client Appreciation Event",
        type: "Promotion",
        status: "Active",
        startDate: "2024-06-15",
        endDate: "2024-08-30",
        placement: "inline-banner",
        creatives: [{
            id: 1,
            title: "The Art of Appreciation",
            description: "Customizable gift kits to strengthen your client relationships.",
            cta: "View Gifting Kits",
            imageUrl: "https://placehold.co/1200x400.png",
        }]
    },
]

export const mockFlashDeals: FlashDeal[] = [
    {
        product: mockProducts[1],
        discountPercentage: 25,
        endDate: futureDate.toISOString(),
        stock: 100,
        sold: 45,
    },
    {
        product: mockProducts[6],
        discountPercentage: 30,
        endDate: futureDate.toISOString(),
        stock: 50,
        sold: 12,
    },
    {
        product: mockProducts[7],
        discountPercentage: 20,
        endDate: futureDate.toISOString(),
        stock: 80,
        sold: 60,
    },
    {
        product: mockProducts[0],
        discountPercentage: 15,
        endDate: futureDate.toISOString(),
        stock: 40,
        sold: 5,
    },
]

export const mockHeroCampaigns: HeroCampaign[] = [
    {
        title: "Summer Collection is Here!",
        description: "Fresh looks for sunny days. Explore our new arrivals in apparel and accessories.",
        link: "/products?category=Apparel",
        cta: "Shop Now",
        imageUrl: "https://placehold.co/1920x1080.png",
        hint: "summer fashion"
    },
    {
        title: "Upgrade Your Workspace",
        description: "Find the perfect gear to boost your productivity. Desks, chairs, and tech gadgets.",
        link: "/products?category=Furniture",
        cta: "Explore Home Office",
        imageUrl: "https://placehold.co/1920x1080.png",
        hint: "modern office"
    },
    {
        title: "Save Big on Electronics",
        description: "Limited-time deals on headphones, smart watches, and more.",
        link: "/products?category=Electronics",
        cta: "View Deals",
        imageUrl: "https://placehold.co/1920x1080.png",
        hint: "tech gadgets"
    }
]

export const mockOrderedCombos: OrderedCombo[] = [
  {
    id: 'OC001',
    products: [mockProducts[6], mockProducts[3]],
    orderCount: 18,
    orders: [
      { orderId: 'ORD003', customer: mockUsers[4], date: '2024-06-15', vendorId: 'VDR007' },
      { orderId: 'ORD006', customer: mockUsers[0], date: '2024-06-14', vendorId: 'VDR004' },
    ],
  },
  {
    id: 'OC002',
    products: [mockProducts[7], mockProducts[8]],
    orderCount: 12,
    orders: [
      { orderId: 'ORD004', customer: mockUsers[6], date: '2024-06-12', vendorId: 'VDR008' },
    ],
  },
];

export const mockWishlistedCombos: WishlistedCombo[] = [
  {
    id: 'WC001',
    products: [mockProducts[0], mockProducts[2]],
    wishlistCount: 25,
    customers: [
      { customer: mockUsers[0], date: '2024-06-21', vendorId: 'VDR001' },
      { customer: mockUsers[2], date: '2024-06-20', vendorId: 'VDR003' },
    ],
  },
  {
    id: 'WC002',
    products: [mockProducts[4], mockProducts[3]],
    wishlistCount: 21,
    customers: [
      { customer: mockUsers[4], date: '2024-06-19', vendorId: 'VDR005' },
    ],
  },
];

export const mockCorporateBids: CorporateBid[] = [
    {
        id: 'B2XJ5K1M',
        products: [mockProducts[0], mockProducts[3]],
        quantity: 250,
        status: 'Active',
        createdAt: '2024-07-22',
        expiresAt: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 2 days
        responses: [
            { vendorId: 'VDR001', vendorName: 'Timeless Co.', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 165.00, estimatedDelivery: '10 business days' },
            { vendorId: 'VDR004', vendorName: 'Crafty Creations', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 170.50, estimatedDelivery: '8 business days', notes: 'We can offer a faster turnaround if needed.' },
        ]
    },
    {
        id: 'A9S3H7F2',
        products: [mockProducts[1]],
        quantity: 100,
        status: 'Expired',
        createdAt: '2024-07-20',
        expiresAt: '2024-07-22T12:00:00Z',
        responses: [
            { vendorId: 'VDR002', vendorName: 'Gadget Guru', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 120.00, estimatedDelivery: '5 business days' },
        ]
    },
     {
        id: 'P4G8R2T9',
        products: [mockProducts[8], mockProducts[4]],
        quantity: 500,
        status: 'Awarded',
        createdAt: '2024-07-18',
        expiresAt: '2024-07-20T10:00:00Z',
        responses: [
             { vendorId: 'VDR004', vendorName: 'Crafty Creations', vendorAvatar: 'https://placehold.co/40x40.png', pricePerUnit: 18.50, estimatedDelivery: '12 business days' },
        ]
    }
]

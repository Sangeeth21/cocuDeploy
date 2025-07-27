

export type DisplayProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  vendorId: string;
  tags?: string[];
  images?: string[];
  sku?: string;
  stock?: number;
  status?: 'Live' | 'Archived' | 'Needs Review';
  requiresConfirmation?: boolean;
};

export type Review = {
  id: string;
  author: string;
  avatarUrl: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
};

export type Category = {
  name: string;
  imageUrl: string;
  productCount: number;
};

export type Attachment = {
  name: string;
  type: 'image' | 'file';
  url: string;
};

export type Message = {
  id: string;
  sender: "customer" | "vendor" | "system";
  text: string;
  attachments?: Attachment[];
  status?: 'sent' | 'delivered' | 'read';
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: 'Customer' | 'Vendor' | 'Admin';
    status: 'Active' | 'Suspended';
    joinedDate: string;
    avatar: string;
}

export type Conversation = {
  id: number;
  vendorId: string;
  customerId?: string; // For vendor/admin view
  avatar: string;
  messages: Message[];
  unread?: boolean;
  userMessageCount: number;
  awaitingVendorDecision: boolean;
  status: 'active' | 'flagged' | 'locked';
};


// Order Management
export type OrderItem = {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
};

export type Order = {
    id: string;
    date: string;
    customer: {
        id: string;
        name: string;
        email: string;
        avatar: string;
    };
    items: OrderItem[];
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    shippingAddress: {
        recipient: string;
        line1: string;
        city: string;
        zip: string;
    };
    payment: {
        method: string;
        last4: string;
    };
};


// Marketing and Promotions
export type MarketingCampaign = {
    id: string;
    name: string;
    type: 'Sale' | 'Promotion' | 'Flash Sale' | 'Freebie' | 'Combo Offer';
    status: 'Active' | 'Scheduled' | 'Finished' | 'Draft';
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    showCountdown?: boolean;
}

export type FlashDeal = {
    product: DisplayProduct;
    discountPercentage: number;
    endDate: string;
    stock: number;
    sold: number;
}

export type HeroCampaign = {
    title: string;
    description: string;
    link: string;
    cta: string;
    imageUrl: string;
    hint: string;
}

// Product Combos
export type OrderedCombo = {
  id: string;
  products: DisplayProduct[];
  orderCount: number;
  orders: {
    orderId: string;
    customer: User;
    date: string;
    vendorId: string;
  }[];
};

export type WishlistedCombo = {
  id: string;
  products: DisplayProduct[];
  wishlistCount: number;
  customers: {
    customer: User;
    date: string;
    vendorId: string;
  }[];
};

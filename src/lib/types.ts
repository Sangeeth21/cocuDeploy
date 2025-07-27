
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
  sender: "customer" | "vendor";
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

// Marketing and Promotions
export type MarketingCampaign = {
    id: string;
    name: string;
    type: 'Sale' | 'Promotion' | 'Flash Sale' | 'Freebie' | 'Combo Offer';
    status: 'Active' | 'Scheduled' | 'Finished' | 'Draft';
    startDate: string;
    endDate: string;
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

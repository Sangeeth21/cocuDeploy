
export type Product = {
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

    

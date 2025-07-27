export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  vendor: string;
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

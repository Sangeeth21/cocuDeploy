

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

// --- Smart Pricing Engine (SPE) Types ---

type AIReview = {
    suggestedSP: number;
    discount: number;
    reasoning: string;
};

export type SPE_Product = {
    vendorSP: number;
    vendorInputs: {
        description: string;
        images: string[];
        keywords: string[];
    };
    status: "Under Review" | "Live" | "Rejected";
    aiReviews?: {
        chatgpt?: AIReview;
        claude?: AIReview;
        gemini?: AIReview;
    };
    adminInputs?: {
        competitorPriceRange?: string;
        discountPercent?: string;
        edt?: string;
        offerType?: "Festival" | "Launch" | "Clearance" | "Limited Stock" | "None";
        selectedFreebies?: string[];
    };
    marginSummary?: {
        customerPrice: number;
        vendorSP: number;
        buffer: number;
        logisticsCost: number;
        pgFees: number;
        payoutFees: number;
        platformCommission: number;
        freebieCost: number;
        finalMargin: number;
    };
    audit?: {
        approvalStatus: "Pending" | "Approved" | "Rejected";
        editedAfterAI: boolean;
        approvalDisabled: boolean;
        lastRecalculated: any; // Firestore Timestamp
    };
};

export type SPE_Freebie = {
    name: string;
    cost: number;
    available: boolean;
    aliasFreebies: string[];
    imageURL: string;
};

export type SPE_AIRequest = {
    productId: string;
    requestTime: any; // Firestore Timestamp
    modelsQueried: ("chatgpt" | "claude" | "gemini")[];
    totalCost: number;
    tokensUsed?: {
        chatgpt?: number;
        claude?: number;
        gemini?: number;
    };
};


'use server';

import { db } from '@/lib/firebase';
import { mockUsers, mockProducts, mockOrders, mockCategories, mockNotifications, mockMarketingCampaigns, mockCorporateBids, mockAiImageStyles, mockPrograms, mockReviews } from '@/lib/mock-data';
import { collection, writeBatch, doc } from 'firebase/firestore';

export async function seedDatabase() {
  const batch = writeBatch(db);

  // Seed Users
  const usersCol = collection(db, 'users');
  mockUsers.forEach((user) => {
    const userRef = doc(usersCol, user.id);
    batch.set(userRef, user);
  });

  // Seed Products
  const productsCol = collection(db, 'products');
  mockProducts.forEach((product) => {
    const productRef = doc(productsCol, product.id);
    batch.set(productRef, product);
  });
  
  // Seed Reviews
  const reviewsCol = collection(db, 'reviews');
  mockReviews.forEach((review) => {
    const reviewRef = doc(reviewsCol, review.id);
    batch.set(reviewRef, review);
  });

  // Seed Orders
  const ordersCol = collection(db, 'orders');
  mockOrders.forEach((order) => {
    const orderRef = doc(ordersCol, order.id);
    // Convert JS Date to Firestore Timestamp for seeding
    const firestoreOrder = { ...order, date: order.date };
    batch.set(orderRef, firestoreOrder);
  });

  // Seed Categories
  const categoriesCol = collection(db, 'categories');
  mockCategories.forEach((category) => {
    const categoryRef = doc(categoriesCol, category.name);
    batch.set(categoryRef, category);
  });
  
  // Seed Marketing Campaigns
  const campaignsCol = collection(db, 'marketingCampaigns');
  mockMarketingCampaigns.forEach((campaign) => {
    const campaignRef = doc(campaignsCol, campaign.id);
    batch.set(campaignRef, campaign);
  });
  
   // Seed Corporate Bids
  const bidsCol = collection(db, 'corporateBids');
  mockCorporateBids.forEach((bid) => {
    const bidRef = doc(bidsCol, bid.id);
    const firestoreBid = { ...bid, createdAt: bid.createdAt };
    batch.set(bidRef, firestoreBid);
  });

  // Seed Notifications
  const notificationsCol = collection(db, 'notifications');
  mockNotifications.forEach((notification) => {
    const notificationRef = doc(collection(db, 'notifications')); // Auto-generate ID
    const firestoreNotification = { ...notification, timestamp: new Date(notification.timestamp) };
    batch.set(notificationRef, firestoreNotification);
  });
  
  // Seed AI Image Styles
  const aiStylesCol = collection(db, 'aiImageStyles');
  mockAiImageStyles.forEach((style) => {
    const styleRef = doc(aiStylesCol, style.id);
    batch.set(styleRef, style);
  });
  
  // Seed Programs
  const programsCol = collection(db, 'programs');
  mockPrograms.forEach((program) => {
    const programRef = doc(collection(db, 'programs')); // Auto-generate ID
    batch.set(programRef, program);
  });

  try {
    await batch.commit();
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Database seeding failed: ${errorMessage}` };
  }
}

import { setDoc, doc, getDocs, collection, writeBatch, query, limit } from 'firebase/firestore';
import { db } from './firebase';

const initialGifts = [
  { giftId: 'rose', name: 'Rose', price: 1, icon: '🌹' },
  { giftId: 'coffee', name: 'Coffee', price: 5, icon: '☕' },
  { giftId: 'heart', name: 'Heart', price: 10, icon: '❤️' },
  { giftId: 'diamond', name: 'Diamond', price: 50, icon: '💎' },
  { giftId: 'crown', name: 'Crown', price: 100, icon: '👑' },
  { giftId: 'rocket', name: 'Rocket', price: 500, icon: '🚀' },
  { giftId: 'castle', name: 'Castle', price: 1000, icon: '🏰' },
  { giftId: 'yacht', name: 'Yacht', price: 5000, icon: '🛥️' },
];

export async function seedGifts() {
  try {
    const giftsRef = collection(db, 'gifts');
    const q = query(giftsRef, limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Seeding gifts...');
      const batch = writeBatch(db);
      for (const gift of initialGifts) {
        const giftDoc = doc(db, 'gifts', gift.giftId);
        batch.set(giftDoc, gift);
      }
      await batch.commit();
      console.log('Gifts seeded!');
    }
  } catch (error) {
    console.error('Error seeding gifts:', error);
  }
}

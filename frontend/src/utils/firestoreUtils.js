import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper to safely convert Firestore timestamp or null to JS Date
function toDateMaybe(ts) {
  // Works for Timestamp, Date, or null/undefined
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  if (ts instanceof Date) return ts;
  return null;
}

// Save a goal to Firestore
export const saveGoalToFirestore = async (userId, goalText) => {
  try {
    const docRef = await addDoc(collection(db, `users/${userId}/goals`), {
      text: goalText,
      completed: false,
      createdAt: new Date(),
      completedAt: null,
      date: new Date().toDateString() // For daily organization
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

// Load today's goals for a user
export const loadTodaysGoals = async (userId) => {
  try {
    const today = new Date().toDateString();
    const q = query(
      collection(db, `users/${userId}/goals`),
      where("date", "==", today),
      orderBy("createdAt", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      goals.push({
        id: docSnap.id,
        ...data,
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt)
      });
    });
    return goals;
  } catch (error) {
    console.error('Error loading goals:', error);
    throw error;
  }
};

// Load all completed goals for a user (for archive)
// Sorted with newest completed first
export const loadAllCompletedGoals = async (userId) => {
  try {
    const q = query(
      collection(db, `users/${userId}/goals`),
      where("completed", "==", true),
      orderBy("completedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const completedGoals = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      completedGoals.push({
        id: docSnap.id,
        ...data,
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt)
      });
    });
    return completedGoals;
  } catch (error) {
    console.error('Error loading completed goals:', error);
    throw error;
  }
};

// Update goal completion status
export const updateGoalCompletion = async (userId, goalId, completed) => {
  try {
    const goalRef = doc(db, `users/${userId}/goals`, goalId);
    await updateDoc(goalRef, {
      completed,
      completedAt: completed ? new Date() : null
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

// Clear goals based on completion status
export const clearGoals = async (userId, option) => {
  try {
    const today = new Date().toDateString();
    let q;
    
    if (option === 'completed') {
      q = query(
        collection(db, `users/${userId}/goals`),
        where("date", "==", today),
        where("completed", "==", true)
      );
    } else if (option === 'incomplete') {
      q = query(
        collection(db, `users/${userId}/goals`),
        where("date", "==", today),
        where("completed", "==", false)
      );
    } else { // 'all'
      q = query(
        collection(db, `users/${userId}/goals`),
        where("date", "==", today)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return querySnapshot.size; // Return number of deleted goals
  } catch (error) {
    console.error('Error clearing goals:', error);
    throw error;
  }
};

// Clear all completed goals for a user (for the archive)
export const clearAllCompletedGoals = async (userId) => {
  try {
    const q = query(
      collection(db, `users/${userId}/goals`),
      where("completed", "==", true)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error('Error clearing completed goals:', error);
    throw error;
  }
};

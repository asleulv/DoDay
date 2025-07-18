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
      date: new Date().toDateString() // For grouping by display date
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

export const loadActiveGoals = async (userId) => {
  try {
    const todayStr = new Date().toDateString();
    const goalsRef = collection(db, `users/${userId}/goals`);

    // 1. Incomplete goals (from any day)
    const incompleteQuery = query(goalsRef, where('completed', '==', false));
    const incompleteSnap = await getDocs(incompleteQuery);
    const incompleteGoals = incompleteSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt)
      };
    });

    // 2. Completed today
    const completedTodayQuery = query(
      goalsRef,
      where('completed', '==', true),
      where('date', '==', todayStr),
    );
    const completedSnap = await getDocs(completedTodayQuery);
    const completedGoals = completedSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt)
      };
    });

    return [...incompleteGoals, ...completedGoals];
  } catch (error) {
    console.error('Error loading active goals:', error);
    throw error;
  }
};

// (existing completed goals archive)
export const loadAllCompletedGoals = async (userId) => {
  try {
    const q = query(
      collection(db, `users/${userId}/goals`),
      where("completed", "==", true),
      orderBy("completedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt)
      };
    });
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

// Clear goals based on completion status for today
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
    } else {
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
    return querySnapshot.size;
  } catch (error) {
    console.error('Error clearing goals:', error);
    throw error;
  }
};

// Clear all completed goals entirely
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

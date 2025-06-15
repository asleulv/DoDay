import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

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
    querySnapshot.forEach((doc) => {
      goals.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(), // Convert Firestore timestamp
        completedAt: doc.data().completedAt?.toDate()
      });
    });
    
    return goals;
  } catch (error) {
    console.error('Error loading goals:', error);
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

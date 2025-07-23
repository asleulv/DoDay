import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper to safely convert Firestore timestamp or null to JS Date
function toDateMaybe(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts instanceof Date) return ts;
  return null;
}

// Save multiple structured goals (each with an array of subtasks { title, completed })
export const saveGoalToFirestore = async (userId, goals) => {
  try {
    const coll = collection(db, `users/${userId}/goals`);
    const batch = writeBatch(db);
    const timestamp = new Date();
    const todayStr = timestamp.toDateString();

    goals.forEach((goal) => {
      const docRef = doc(coll); // generate a new doc ID
      batch.set(docRef, {
        text: goal.text,
        subtasks: (goal.subtasks || []).map((titleOrObj) =>
          typeof titleOrObj === 'string'
            ? { title: titleOrObj, completed: false }
            : { title: titleOrObj.title, completed: !!titleOrObj.completed }
        ),
        completed:
          (goal.subtasks || []).length > 0
            ? (goal.subtasks || []).every(
                (st) =>
                  (typeof st === 'object' ? st.completed : false) === true
              )
            : false,
        createdAt: timestamp,
        completedAt: null,
        date: todayStr,
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error adding goals:', error);
    throw error;
  }
};

// Load incomplete + today's completed goals
export const loadActiveGoals = async (userId) => {
  try {
    const todayStr = new Date().toDateString();
    const goalsRef = collection(db, `users/${userId}/goals`);

    // 1. Incomplete goals
    const incompleteQuery = query(goalsRef, where('completed', '==', false));
    const incompleteSnap = await getDocs(incompleteQuery);
    const incompleteGoals = incompleteSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        subtasks: (data.subtasks || []).map((st) =>
          typeof st === 'string'
            ? { title: st, completed: false }
            : { title: st.title, completed: !!st.completed }
        ),
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt),
      };
    });

    // 2. Completed today
    const completedTodayQuery = query(
      goalsRef,
      where('completed', '==', true),
      where('date', '==', todayStr)
    );
    const completedSnap = await getDocs(completedTodayQuery);
    const completedGoals = completedSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        subtasks: (data.subtasks || []).map((st) =>
          typeof st === 'string'
            ? { title: st, completed: false }
            : { title: st.title, completed: !!st.completed }
        ),
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt),
      };
    });

    return [...incompleteGoals, ...completedGoals];
  } catch (error) {
    console.error('Error loading active goals:', error);
    throw error;
  }
};

// Load all completed goals (for archive / history view)
export const loadAllCompletedGoals = async (userId) => {
  try {
    const q = query(
      collection(db, `users/${userId}/goals`),
      where('completed', '==', true),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        subtasks: (data.subtasks || []).map((st) =>
          typeof st === 'string'
            ? { title: st, completed: false }
            : { title: st.title, completed: !!st.completed }
        ),
        createdAt: toDateMaybe(data.createdAt),
        completedAt: toDateMaybe(data.completedAt),
      };
    });
  } catch (error) {
    console.error('Error loading completed goals:', error);
    throw error;
  }
};

// Update a specific subtask's completion and propagate main task completion status
export const updateSubtasksAndGoalCompletion = async (
  userId,
  goalId,
  updatedSubtasks
) => {
  try {
    const goalRef = doc(db, `users/${userId}/goals`, goalId);
    const allComplete =
      updatedSubtasks.length > 0 &&
      updatedSubtasks.every((sub) => sub.completed);

    await updateDoc(goalRef, {
      subtasks: updatedSubtasks,
      completed: allComplete,
      completedAt: allComplete ? new Date() : null,
    });
  } catch (error) {
    console.error('Error updating subtasks:', error);
    throw error;
  }
};

// (Optional) To manually mark main-task complete (should rarely be used now)
export const updateGoalCompletion = async (userId, goalId, completed) => {
  try {
    const goalRef = doc(db, `users/${userId}/goals`, goalId);
    await updateDoc(goalRef, {
      completed,
      completedAt: completed ? new Date() : null,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

// Clear today's goals based on option: "completed", "incomplete", or "all"
export const clearGoals = async (userId, option) => {
  try {
    const today = new Date().toDateString();
    let q;

    if (option === 'completed') {
      q = query(
        collection(db, `users/${userId}/goals`),
        where('date', '==', today),
        where('completed', '==', true)
      );
    } else if (option === 'incomplete') {
      q = query(
        collection(db, `users/${userId}/goals`),
        where('date', '==', today),
        where('completed', '==', false)
      );
    } else {
      // all goals from today
      q = query(
        collection(db, `users/${userId}/goals`),
        where('date', '==', today)
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

// Remove all completed goals permanently
export const clearAllCompletedGoals = async (userId) => {
  try {
    const q = query(
      collection(db, `users/${userId}/goals`),
      where('completed', '==', true)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error('Error clearing completed goals:', error);
    throw error;
  }
};

// Slett eit enkelt mål
export const deleteGoal = async (userId, goalId) => {
  const goalRef = doc(db, `users/${userId}/goals/${goalId}`);
  await deleteDoc(goalRef);
};

export async function loadCompletedGoalsPaginated(
  uid,
  searchTerm = '',
  lastDoc = null,
  pageSize = 30
) {
  if (!uid) return { tasks: [], lastVisible: null }

  try {
    const ref = collection(db, `users/${uid}/goals`)
    let q = query(
      ref,
      where('completed', '==', true),
      orderBy('completedAt', 'desc'),
      limit(pageSize)
    )

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const snapshot = await getDocs(q)
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] ?? null

    return {
      tasks: tasks || [],
      lastVisible
    }
  } catch (e) {
    console.error('🔥 Firestore error:', e)
    return {
      tasks: [],
      lastVisible: null
    }
  }
}

import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query, where } from 'firebase/firestore';

export async function createWorkspace(ownerId: string, name: string) {
  const id = uuidv4();
  const workspaceRef = doc(db, 'workspaces', id);
  const now = Date.now();
  await setDoc(workspaceRef, {
    name,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  
  // Create member doc
  const memberRef = doc(db, `workspaces/${id}/members/${ownerId}`);
  await setDoc(memberRef, {
    role: 'owner',
    joinedAt: now
  });
  
  return id;
}

export async function getUserWorkspaces(userId: string) {
  const q = query(collection(db, 'workspaces'), where('ownerId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

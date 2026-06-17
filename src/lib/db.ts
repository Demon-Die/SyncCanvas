import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length: 8}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export async function createWorkspace(ownerId: string, name: string) {
  const id = generateRoomCode();
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

export async function deleteWorkspace(id: string) {
  await deleteDoc(doc(db, 'workspaces', id));
}

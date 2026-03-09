import { collection, getDocs, query, orderBy, getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './config';
import { toTimestampMs } from './timestamp-helpers';

export interface UserRecord {
  uid: string;
  email: string;
  clubName: string;
  role: 'admin' | 'player';
  createdAt: number | null;
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const db = getFirestore(getFirebaseApp());
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email as string,
      clubName: data.clubName as string,
      role: (data.role as 'admin' | 'player') ?? 'player',
      createdAt: toTimestampMs(data.createdAt),
    };
  });
}

import {
	getFirestore,
	collection,
	doc,
	getDocs,
	setDoc,
	deleteDoc,
	onSnapshot,
	query,
	orderBy,
	writeBatch,
	type Firestore,
	type Unsubscribe,
} from 'firebase/firestore';
import { type LeaderboardSnapshot } from '@badminton/types';
import { getFirebaseApp } from './config';

let db: Firestore | null = null;

function getDb(): Firestore {
	if (!db) {
		db = getFirestore(getFirebaseApp());
	}
	return db;
}

function leaderboardCollection(uid: string) {
	return collection(getDb(), 'users', uid, 'leaderboardSnapshots');
}

export async function saveLeaderboardSnapshot(
	uid: string,
	snapshot: LeaderboardSnapshot,
): Promise<void> {
	await setDoc(doc(leaderboardCollection(uid), snapshot.id), snapshot);
}

export function subscribeToLeaderboardSnapshots(
	uid: string,
	onData: (snapshots: LeaderboardSnapshot[]) => void,
	onError?: (error: Error) => void,
): Unsubscribe {
	const q = query(leaderboardCollection(uid), orderBy('createdAt', 'desc'));
	return onSnapshot(
		q,
		(snap) => {
			onData(snap.docs.map((d) => d.data() as LeaderboardSnapshot));
		},
		onError,
	);
}

export async function deleteLeaderboardSnapshot(
	uid: string,
	snapshotId: string,
): Promise<void> {
	await deleteDoc(doc(leaderboardCollection(uid), snapshotId));
}

export async function clearLeaderboardSnapshots(uid: string): Promise<void> {
	const snap = await getDocs(leaderboardCollection(uid));
	const batch = writeBatch(getDb());
	for (const d of snap.docs) {
		batch.delete(d.ref);
	}
	await batch.commit();
}

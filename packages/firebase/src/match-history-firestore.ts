import {
	getFirestore,
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	deleteDoc,
	onSnapshot,
	query,
	where,
	orderBy,
	limit as firestoreLimit,
	writeBatch,
	type Firestore,
	type Unsubscribe,
} from 'firebase/firestore';
import { type MatchRecord } from '@badminton/types';
import { getFirebaseApp } from './config';

let db: Firestore | null = null;

function getDb(): Firestore {
	if (!db) {
		db = getFirestore(getFirebaseApp());
	}
	return db;
}

function matchHistoryCollection(uid: string) {
	return collection(getDb(), 'users', uid, 'matchHistory');
}

export async function saveMatchRecord(
	uid: string,
	record: MatchRecord,
): Promise<void> {
	await setDoc(doc(matchHistoryCollection(uid), record.id), record);
}

export async function saveMatchRecordsBatch(
	uid: string,
	records: MatchRecord[],
): Promise<void> {
	const batch = writeBatch(getDb());
	for (const record of records) {
		batch.set(doc(matchHistoryCollection(uid), record.id), record);
	}
	await batch.commit();
}

export async function getMatchHistory(
	uid: string,
	maxResults?: number,
): Promise<MatchRecord[]> {
	const col = matchHistoryCollection(uid);
	const q = maxResults
		? query(col, orderBy('finishedAt', 'desc'), firestoreLimit(maxResults))
		: query(col, orderBy('finishedAt', 'desc'));
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as MatchRecord);
}

export async function getMatchHistoryBySession(
	uid: string,
	sessionId: string,
): Promise<MatchRecord[]> {
	const q = query(
		matchHistoryCollection(uid),
		where('sessionId', '==', sessionId),
		orderBy('finishedAt', 'desc'),
	);
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as MatchRecord);
}

export function subscribeToMatchHistory(
	uid: string,
	onData: (records: MatchRecord[]) => void,
	onError?: (error: Error) => void,
): Unsubscribe {
	const q = query(matchHistoryCollection(uid), orderBy('finishedAt', 'desc'));
	return onSnapshot(
		q,
		(snap) => {
			onData(snap.docs.map((d) => d.data() as MatchRecord));
		},
		onError,
	);
}

export async function deleteMatchRecord(
	uid: string,
	recordId: string,
): Promise<void> {
	await deleteDoc(doc(matchHistoryCollection(uid), recordId));
}

export async function clearMatchHistory(uid: string): Promise<void> {
	const snap = await getDocs(matchHistoryCollection(uid));
	const batch = writeBatch(getDb());
	for (const d of snap.docs) {
		batch.delete(d.ref);
	}
	await batch.commit();
}

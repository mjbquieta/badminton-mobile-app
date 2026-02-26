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
	type Firestore,
	type Unsubscribe,
} from 'firebase/firestore';
import { type ScheduledSession } from '@badminton/types';
import { getFirebaseApp } from './config';

let db: Firestore | null = null;

function getDb(): Firestore {
	if (!db) {
		db = getFirestore(getFirebaseApp());
	}
	return db;
}

function schedulesCollection(uid: string) {
	return collection(getDb(), 'users', uid, 'schedules');
}

// Firestore rejects undefined values — JSON round-trip strips them
const clean = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function saveSchedule(uid: string, session: ScheduledSession): Promise<void> {
	await setDoc(doc(schedulesCollection(uid), session.id), clean(session));
}

export async function getSchedules(uid: string): Promise<ScheduledSession[]> {
	const q = query(schedulesCollection(uid), orderBy('date', 'asc'));
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as ScheduledSession);
}

export async function updateSchedule(uid: string, session: ScheduledSession): Promise<void> {
	await setDoc(doc(schedulesCollection(uid), session.id), clean(session));
}

export async function deleteSchedule(uid: string, sessionId: string): Promise<void> {
	await deleteDoc(doc(schedulesCollection(uid), sessionId));
}

export function subscribeToSchedules(
	uid: string,
	onData: (sessions: ScheduledSession[]) => void,
	onError?: (error: Error) => void,
): Unsubscribe {
	const q = query(schedulesCollection(uid), orderBy('date', 'asc'));
	return onSnapshot(
		q,
		(snap) => {
			onData(snap.docs.map((d) => d.data() as ScheduledSession));
		},
		onError,
	);
}

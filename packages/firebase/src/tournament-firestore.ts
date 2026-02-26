import {
	getFirestore,
	collection,
	doc,
	getDocs,
	getDoc,
	setDoc,
	deleteDoc,
	onSnapshot,
	query,
	orderBy,
	type Firestore,
	type Unsubscribe,
} from 'firebase/firestore';
import { type Tournament } from '@badminton/types';
import { getFirebaseApp } from './config';

let db: Firestore | null = null;

function getDb(): Firestore {
	if (!db) {
		db = getFirestore(getFirebaseApp());
	}
	return db;
}

function tournamentsCollection(uid: string) {
	return collection(getDb(), 'users', uid, 'tournaments');
}

// Firestore rejects undefined values — JSON round-trip strips them
const clean = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function saveTournament(uid: string, tournament: Tournament): Promise<void> {
	await setDoc(doc(tournamentsCollection(uid), tournament.id), clean(tournament));
}

export async function getTournaments(uid: string): Promise<Tournament[]> {
	const q = query(tournamentsCollection(uid), orderBy('createdAt', 'desc'));
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as Tournament);
}

export async function getTournament(uid: string, tournamentId: string): Promise<Tournament | null> {
	const snap = await getDoc(doc(tournamentsCollection(uid), tournamentId));
	return snap.exists() ? (snap.data() as Tournament) : null;
}

export async function updateTournament(uid: string, tournament: Tournament): Promise<void> {
	await setDoc(doc(tournamentsCollection(uid), tournament.id), clean(tournament));
}

export async function deleteTournament(uid: string, tournamentId: string): Promise<void> {
	await deleteDoc(doc(tournamentsCollection(uid), tournamentId));
}

export function subscribeToTournaments(
	uid: string,
	onData: (tournaments: Tournament[]) => void,
	onError?: (error: Error) => void,
): Unsubscribe {
	const q = query(tournamentsCollection(uid), orderBy('createdAt', 'desc'));
	return onSnapshot(
		q,
		(snap) => {
			onData(snap.docs.map((d) => d.data() as Tournament));
		},
		onError,
	);
}

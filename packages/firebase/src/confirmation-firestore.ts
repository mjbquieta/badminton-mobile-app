import {
	getFirestore,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	onSnapshot,
	serverTimestamp,
	type Firestore,
	type Unsubscribe,
} from 'firebase/firestore';
import {
	type ConfirmationDocument,
	type PlayerConfirmation,
	type EventDetails,
} from '@badminton/types';
import { getFirebaseApp } from './config';

let db: Firestore | null = null;

function getDb(): Firestore {
	if (!db) {
		db = getFirestore(getFirebaseApp());
	}
	return db;
}

export async function createConfirmationDoc(
	serialId: string,
	ownerId: string,
	pin: string,
	eventDetails: EventDetails,
	playerConfirmations: PlayerConfirmation[],
): Promise<void> {
	await setDoc(doc(getDb(), 'confirmations', serialId), {
		eventDetails,
		playerConfirmations,
		locked: false,
		ownerId,
		pin,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
}

export async function getConfirmationDoc(
	serialId: string,
): Promise<ConfirmationDocument | null> {
	const snap = await getDoc(doc(getDb(), 'confirmations', serialId));
	if (!snap.exists()) return null;
	return snap.data() as ConfirmationDocument;
}

export async function updateConfirmationEventDetails(
	serialId: string,
	eventDetails: EventDetails,
): Promise<void> {
	await updateDoc(doc(getDb(), 'confirmations', serialId), {
		eventDetails,
		updatedAt: serverTimestamp(),
	});
}

export async function updateConfirmationPlayers(
	serialId: string,
	playerConfirmations: PlayerConfirmation[],
): Promise<void> {
	await updateDoc(doc(getDb(), 'confirmations', serialId), {
		playerConfirmations,
		updatedAt: serverTimestamp(),
	});
}

export async function updatePlayerConfirmation(
	serialId: string,
	playerId: string,
	status: 'confirmed' | 'declined',
	existingConfirmations: PlayerConfirmation[],
): Promise<void> {
	const updated = existingConfirmations.map((pc) =>
		pc.playerId === playerId
			? { ...pc, status, confirmedAt: Date.now() }
			: pc,
	);
	await updateDoc(doc(getDb(), 'confirmations', serialId), {
		playerConfirmations: updated,
		updatedAt: serverTimestamp(),
	});
}

export async function lockConfirmationDoc(serialId: string): Promise<void> {
	await updateDoc(doc(getDb(), 'confirmations', serialId), {
		locked: true,
		updatedAt: serverTimestamp(),
	});
}

export async function unlockConfirmationDoc(serialId: string): Promise<void> {
	await updateDoc(doc(getDb(), 'confirmations', serialId), {
		locked: false,
		updatedAt: serverTimestamp(),
	});
}

export async function deleteConfirmationDoc(serialId: string): Promise<void> {
	await deleteDoc(doc(getDb(), 'confirmations', serialId));
}

export function subscribeToConfirmation(
	serialId: string,
	onData: (data: ConfirmationDocument) => void,
	onError?: (error: Error) => void,
): Unsubscribe {
	return onSnapshot(
		doc(getDb(), 'confirmations', serialId),
		(snap) => {
			if (!snap.exists()) return;
			onData(snap.data() as ConfirmationDocument);
		},
		onError,
	);
}

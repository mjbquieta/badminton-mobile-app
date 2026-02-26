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
import { type DraftTemplate } from '@badminton/types';
import { getFirebaseApp } from './config';

let db: Firestore | null = null;

function getDb(): Firestore {
	if (!db) {
		db = getFirestore(getFirebaseApp());
	}
	return db;
}

function templatesCollection(uid: string) {
	return collection(getDb(), 'users', uid, 'draftTemplates');
}

// Firestore rejects undefined values — JSON round-trip strips them
const clean = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function saveDraftTemplate(uid: string, template: DraftTemplate): Promise<void> {
	await setDoc(doc(templatesCollection(uid), template.id), clean(template));
}

export async function getDraftTemplates(uid: string): Promise<DraftTemplate[]> {
	const q = query(templatesCollection(uid), orderBy('createdAt', 'desc'));
	const snap = await getDocs(q);
	return snap.docs.map((d) => d.data() as DraftTemplate);
}

export async function deleteDraftTemplate(uid: string, templateId: string): Promise<void> {
	await deleteDoc(doc(templatesCollection(uid), templateId));
}

export function subscribeToDraftTemplates(
	uid: string,
	onData: (templates: DraftTemplate[]) => void,
	onError?: (error: Error) => void,
): Unsubscribe {
	const q = query(templatesCollection(uid), orderBy('createdAt', 'desc'));
	return onSnapshot(
		q,
		(snap) => {
			onData(snap.docs.map((d) => d.data() as DraftTemplate));
		},
		onError,
	);
}

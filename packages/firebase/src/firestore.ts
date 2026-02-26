import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { type Player, type Court, type Draft, type ConfirmationMeta } from '@badminton/types';
import { getFirebaseApp } from './config';

export interface SessionData {
  players: Player[];
  courts: Court[];
  drafts: Draft[];
  confirmation?: ConfirmationMeta;
  createdAt: unknown;
  updatedAt: unknown;
}

let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

// --- Session CRUD ---

export async function createSession(
  sessionId: string,
  players: Player[],
  courts: Court[],
  drafts: Draft[] = []
): Promise<void> {
  await setDoc(doc(getDb(), 'sessions', sessionId), {
    players,
    courts: courts.map(courtToFirestore),
    drafts,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getSession(
  sessionId: string
): Promise<SessionData | null> {
  const snap = await getDoc(doc(getDb(), 'sessions', sessionId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    players: data.players ?? [],
    courts: (data.courts ?? []).map(courtFromFirestore),
    drafts: data.drafts ?? [],
    confirmation: data.confirmation ?? undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateSessionPlayers(
  sessionId: string,
  players: Player[]
): Promise<void> {
  await updateDoc(doc(getDb(), 'sessions', sessionId), {
    players,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSessionCourts(
  sessionId: string,
  courts: Court[]
): Promise<void> {
  await updateDoc(doc(getDb(), 'sessions', sessionId), {
    courts: courts.map(courtToFirestore),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSessionFull(
  sessionId: string,
  players: Player[],
  courts: Court[],
  drafts: Draft[] = [],
  confirmation?: ConfirmationMeta
): Promise<void> {
  const data: Record<string, unknown> = {
    players,
    courts: courts.map(courtToFirestore),
    drafts,
    updatedAt: serverTimestamp(),
  };
  if (confirmation) {
    data.confirmation = confirmation;
  }
  await setDoc(doc(getDb(), 'sessions', sessionId), data, { merge: true });
}

export async function updateSessionDrafts(
  sessionId: string,
  drafts: Draft[]
): Promise<void> {
  await updateDoc(doc(getDb(), 'sessions', sessionId), {
    drafts,
    updatedAt: serverTimestamp(),
  });
}

// --- Real-time Listener ---

export function subscribeToSession(
  sessionId: string,
  onData: (data: SessionData) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(getDb(), 'sessions', sessionId),
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      onData({
        players: data.players ?? [],
        courts: (data.courts ?? []).map(courtFromFirestore),
        drafts: data.drafts ?? [],
        confirmation: data.confirmation ?? undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    },
    onError
  );
}

// --- Helpers ---
// Court.players is Player[] but Firestore stores nested objects.
// These helpers ensure correct serialization/deserialization.

function courtToFirestore(court: Court) {
  return {
    id: court.id,
    name: court.name,
    isSingle: court.isSingle,
    players: (court.players ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      gameCount: p.gameCount,
      level: p.level,
      trophies: p.trophies ?? 0,
      ...(p.avatarUrl ? { avatarUrl: p.avatarUrl } : {}),
      ...(p.avatarColor ? { avatarColor: p.avatarColor } : {}),
    })),
  };
}

function courtFromFirestore(data: Record<string, unknown>): Court {
  return {
    id: data.id as string,
    name: data.name as string,
    isSingle: data.isSingle as boolean,
    players: ((data.players as Record<string, unknown>[]) ?? []).map((p) => ({
      id: p.id as string,
      name: p.name as string,
      gameCount: p.gameCount as number,
      level: p.level as Player['level'],
      trophies: (p.trophies as number) ?? 0,
      ...(p.avatarUrl ? { avatarUrl: p.avatarUrl as string } : {}),
      ...(p.avatarColor ? { avatarColor: p.avatarColor as string } : {}),
    })),
  };
}

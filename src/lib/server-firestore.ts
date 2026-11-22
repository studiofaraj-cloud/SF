import 'server-only';

import {
  FieldValue,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type OrderByDirection,
  type Query,
  type QueryDocumentSnapshot,
  type SetOptions,
  type Transaction,
  type WhereFilterOp,
} from 'firebase-admin/firestore';
import { adminDb } from '@/firebase/admin';

/**
 * The few Firestore calls the server makes (src/lib/firestore-data.ts and the
 * actions), with the web SDK's names and shapes, running on the Admin SDK.
 *
 * The server used the web SDK unauthenticated, which only worked because the
 * security rules let anyone read and write everything. With the Admin SDK the
 * rules can be closed and the calling code stays as it was. Only what the
 * code uses is here; snapshots keep the web SDK's `exists()` method (the
 * Admin SDK has an `exists` property instead).
 *
 * Timestamp is the Admin SDK's: values read and written on the server must
 * all come from here, never from 'firebase/firestore'.
 */

export { Timestamp };
export type { DocumentData };

export const db: Firestore = adminDb();

export type QueryConstraint = (q: Query) => Query;

export function collection(firestore: Firestore, path: string, ...segments: string[]): CollectionReference {
  return firestore.collection([path, ...segments].join('/'));
}

export function doc(firestore: Firestore, path: string, ...segments: string[]): DocumentReference {
  return firestore.doc([path, ...segments].join('/'));
}

export function where(field: string, op: WhereFilterOp, value: unknown): QueryConstraint {
  return (q) => q.where(field, op, value);
}

export function orderBy(field: string, direction: OrderByDirection = 'asc'): QueryConstraint {
  return (q) => q.orderBy(field, direction);
}

export function limit(n: number): QueryConstraint {
  return (q) => q.limit(n);
}

export function query(base: Query, ...constraints: QueryConstraint[]): Query {
  return constraints.reduce((q, apply) => apply(q), base);
}

/**
 * A document snapshot with the web SDK's `exists()` method — a type guard, as
 * there: after `if (snap.exists())`, `data()` is known to be defined.
 */
export type DocSnap<T = DocumentData> = {
  id: string;
  ref: DocumentReference;
  exists(): this is { data(): T } & DocSnap<T>;
  data(): T | undefined;
};

class Snap implements DocSnap {
  constructor(protected snap: DocumentSnapshot) {}
  get id() {
    return this.snap.id;
  }
  get ref() {
    return this.snap.ref;
  }
  exists(): this is { data(): DocumentData } & DocSnap {
    return this.snap.exists;
  }
  data(): DocumentData | undefined {
    return this.snap.data();
  }
}

/** A document from a query: it always exists, so `data()` is defined. */
class QueryDocSnap extends Snap {
  constructor(protected snap: QueryDocumentSnapshot) {
    super(snap);
  }
  data(): DocumentData {
    return this.snap.data();
  }
}

const wrap = (snap: DocumentSnapshot): DocSnap => new Snap(snap);

export type QuerySnap = {
  docs: QueryDocSnap[];
  empty: boolean;
  size: number;
  forEach(fn: (d: QueryDocSnap) => void): void;
};

function wrapQuery(docs: QueryDocumentSnapshot[]): QuerySnap {
  const wrapped = docs.map((d) => new QueryDocSnap(d));
  return { docs: wrapped, empty: wrapped.length === 0, size: wrapped.length, forEach: (fn) => wrapped.forEach(fn) };
}

export async function getDoc(ref: DocumentReference): Promise<DocSnap> {
  return wrap(await ref.get());
}

export async function getDocs(q: Query): Promise<QuerySnap> {
  return wrapQuery((await q.get()).docs);
}

/** The Admin SDK always reads from the server: same as getDocs. */
export const getDocsFromServer = getDocs;

export function addDoc(ref: CollectionReference, data: DocumentData): Promise<DocumentReference> {
  return ref.add(data);
}

export async function setDoc(ref: DocumentReference, data: DocumentData, options?: SetOptions): Promise<void> {
  await (options ? ref.set(data, options) : ref.set(data));
}

export async function updateDoc(ref: DocumentReference, data: DocumentData): Promise<void> {
  await ref.update(data);
}

export async function deleteDoc(ref: DocumentReference): Promise<void> {
  await ref.delete();
}

export const serverTimestamp = () => FieldValue.serverTimestamp();
export const increment = (n: number) => FieldValue.increment(n);
export const deleteField = () => FieldValue.delete();

/** A transaction whose `get` returns snapshots with `exists()`. */
export type Tx = {
  get(ref: DocumentReference): Promise<DocSnap>;
  set(ref: DocumentReference, data: DocumentData, options?: SetOptions): Tx;
  update(ref: DocumentReference, data: DocumentData): Tx;
  delete(ref: DocumentReference): Tx;
};

export function runTransaction<T>(firestore: Firestore, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return firestore.runTransaction((t: Transaction) => {
    const tx: Tx = {
      get: async (ref) => wrap(await t.get(ref)),
      set: (ref, data, options) => {
        if (options) t.set(ref, data, options);
        else t.set(ref, data);
        return tx;
      },
      update: (ref, data) => {
        t.update(ref, data);
        return tx;
      },
      delete: (ref) => {
        t.delete(ref);
        return tx;
      },
    };
    return fn(tx);
  });
}

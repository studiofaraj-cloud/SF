
import "server-only";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { initializeServerSideFirebase } from '@/firebase/server-init';

// Initialize server-side Firebase and get Firestore instance
const { firestore } = initializeServerSideFirebase();
export const db = firestore;

export interface ImageMetadata {
  url: string;
  storagePath: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'code' | 'quote' | 'heading';
  content: string;
  metadata?: {
    language?: string;
    level?: number;
    alt?: string;
    caption?: string;
    [key: string]: any;
  };
}

export interface Blog {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  gallery?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  published: boolean;
}

export interface Project {
  id?: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  featuredImage?: string;
  gallery?: string[];
  technologies?: string[];
  projectUrl?: string;
  githubUrl?: string;
  category?: string;
  clientName?: string;
  metrics?: Array<{ label: string; value: string }>;
  highlights?: string[];
  year?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  published: boolean;
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  service?: string;
  budget?: string;
  source?: 'contact-form' | 'quote-dialog';
  createdAt: Timestamp;
  read: boolean;
}

export interface Subscriber {
  id?: string;
  email: string;
  subscribedAt: Timestamp;
  active: boolean;
}

export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  selectedDate: Timestamp;
  selectedTime?: string | string[];
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  source?: string;
}

const COLLECTIONS = {
  BLOGS: 'blogs',
  PROJECTS: 'projects',
  MESSAGES: 'messages',
  SUBSCRIBERS: 'subscribers',
  BOOKINGS: 'bookings',
  SETTINGS: 'settings',
} as const;

// ─── Hero Slides ───────────────────────────────────────────────────────────────

export interface HeroSlideData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  order: number;
}

const HERO_SLIDES_DOC = 'heroSlides';

export async function getHeroSlides(): Promise<HeroSlideData[]> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, HERO_SLIDES_DOC);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    const data = docSnap.data();
    const slides: HeroSlideData[] = data.slides || [];
    return slides.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
}

export async function saveHeroSlides(slides: HeroSlideData[]): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, HERO_SLIDES_DOC);
    // setDoc with merge:true creates the document if it doesn't exist, or updates it
    await setDoc(docRef, { slides }, { merge: true });
  } catch (error) {
    console.error('Error saving hero slides:', error);
    throw new Error(`Failed to save hero slides: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBlogs(filters?: {
  published?: boolean;
  limitCount?: number;
}): Promise<Blog[]> {
  try {
    const blogsRef = collection(db, COLLECTIONS.BLOGS);
    const constraints: QueryConstraint[] = [];

    if (filters?.published !== undefined) {
      constraints.push(where('published', '==', filters.published));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(blogsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Blog[];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error(`Failed to fetch blogs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBlogById(id: string): Promise<Blog | null> {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, id);
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
      return null;
    }

    return {
      id: blogSnap.id,
      ...blogSnap.data(),
    } as Blog;
  } catch (error) {
    console.error(`Error fetching blog with id ${id}:`, error);
    throw new Error(`Failed to fetch blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    // Validate slug before querying Firestore
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.warn('getBlogBySlug: Invalid slug provided', slug);
      return null;
    }

    const blogsRef = collection(db, COLLECTIONS.BLOGS);
    const q = query(blogsRef, where('slug', '==', slug.trim()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Blog;
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error);
    throw new Error(`Failed to fetch blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createBlogData(blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const blogsRef = collection(db, COLLECTIONS.BLOGS);
    const now = Timestamp.now();

    const newBlog = {
      ...blogData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(blogsRef, newBlog);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw new Error(`Failed to create blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBlogData(id: string, blogData: Partial<Omit<Blog, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, id);
    
    const updateData = {
      ...blogData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(blogRef, updateData);
  } catch (error) {
    console.error(`Error updating blog with id ${id}:`, error);
    throw new Error(`Failed to update blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteBlogData(id: string): Promise<void> {
  try {
    const blogRef = doc(db, COLLECTIONS.BLOGS, id);
    await deleteDoc(blogRef);
  } catch (error) {
    console.error(`Error deleting blog with id ${id}:`, error);
    throw new Error(`Failed to delete blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjects(filters?: {
  limitCount?: number;
}): Promise<Project[]> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const constraints: QueryConstraint[] = [];

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(projectsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return null;
    }

    return {
      id: projectSnap.id,
      ...projectSnap.data(),
    } as Project;
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    throw new Error(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    // Validate slug before querying Firestore
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.warn('getProjectBySlug: Invalid slug provided', slug);
      return null;
    }

    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, where('slug', '==', slug.trim()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Project;
  } catch (error) {
    console.error(`Error fetching project with slug ${slug}:`, error);
    throw new Error(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createProjectData(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const now = Timestamp.now();

    const newProject = {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(projectsRef, newProject);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateProjectData(id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    
    const updateData = {
      ...projectData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(projectRef, updateData);
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw new Error(`Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteProjectData(id: string): Promise<void> {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error(`Error deleting project with id ${id}:`, error);
    throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMessages(filters?: {
  read?: boolean;
  source?: 'contact-form' | 'quote-dialog';
  limitCount?: number;
}): Promise<Message[]> {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    const constraints: QueryConstraint[] = [];

    if (filters?.read !== undefined) {
      constraints.push(where('read', '==', filters.read));
    }

    if (filters?.source) {
      constraints.push(where('source', '==', filters.source));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(messagesRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMessageById(id: string): Promise<Message | null> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
      return null;
    }

    return {
      id: messageSnap.id,
      ...messageSnap.data(),
    } as Message;
  } catch (error) {
    console.error(`Error fetching message with id ${id}:`, error);
    throw new Error(`Failed to fetch message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createMessageData(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
  try {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);

    const newMessage = {
      ...messageData,
      createdAt: Timestamp.now(),
      read: messageData.read ?? false,
    };

    const docRef = await addDoc(messagesRef, newMessage);
    return docRef.id;
  } catch (error) {
    console.error('Error creating message:', error);
    throw new Error(`Failed to create message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateMessageData(id: string, messageData: Partial<Omit<Message, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await updateDoc(messageRef, messageData);
  } catch (error) {
    console.error(`Error updating message with id ${id}:`, error);
    throw new Error(`Failed to update message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteMessageData(id: string): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error(`Error deleting message with id ${id}:`, error);
    throw new Error(`Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function markMessageAsRead(id: string): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await updateDoc(messageRef, { read: true });
  } catch (error) {
    console.error(`Error marking message as read with id ${id}:`, error);
    throw new Error(`Failed to mark message as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function markMessageAsUnread(id: string): Promise<void> {
  try {
    const messageRef = doc(db, COLLECTIONS.MESSAGES, id);
    await updateDoc(messageRef, { read: false });
  } catch (error) {
    console.error(`Error marking message as unread with id ${id}:`, error);
    throw new Error(`Failed to mark message as unread: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getMessagesBySource(source: 'contact-form' | 'quote-dialog'): Promise<Message[]> {
  return getMessages({ source });
}

export async function getSubscribers(filters?: {
  active?: boolean;
  limitCount?: number;
}): Promise<Subscriber[]> {
  try {
    const subscribersRef = collection(db, COLLECTIONS.SUBSCRIBERS);
    const constraints: QueryConstraint[] = [];

    if (filters?.active !== undefined) {
      constraints.push(where('active', '==', filters.active));
    }

    constraints.push(orderBy('subscribedAt', 'desc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(subscribersRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscriber[];
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    throw new Error(`Failed to fetch subscribers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubscriberById(id: string): Promise<Subscriber | null> {
  try {
    const subscriberRef = doc(db, COLLECTIONS.SUBSCRIBERS, id);
    const subscriberSnap = await getDoc(subscriberRef);

    if (!subscriberSnap.exists()) {
      return null;
    }

    return {
      id: subscriberSnap.id,
      ...subscriberSnap.data(),
    } as Subscriber;
  } catch (error) {
    console.error(`Error fetching subscriber with id ${id}:`, error);
    throw new Error(`Failed to fetch subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  try {
    const subscribersRef = collection(db, COLLECTIONS.SUBSCRIBERS);
    const q = query(subscribersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Subscriber;
  } catch (error) {
    console.error(`Error fetching subscriber with email ${email}:`, error);
    throw new Error(`Failed to fetch subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createSubscriberData(subscriberData: Omit<Subscriber, 'id' | 'subscribedAt'>): Promise<string> {
  try {
    const subscribersRef = collection(db, COLLECTIONS.SUBSCRIBERS);

    const newSubscriber = {
      ...subscriberData,
      subscribedAt: Timestamp.now(),
      active: subscriberData.active ?? true,
    };

    const docRef = await addDoc(subscribersRef, newSubscriber);
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscriber:', error);
    throw new Error(`Failed to create subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateSubscriberData(id: string, subscriberData: Partial<Omit<Subscriber, 'id' | 'subscribedAt'>>): Promise<void> {
  try {
    const subscriberRef = doc(db, COLLECTIONS.SUBSCRIBERS, id);
    await updateDoc(subscriberRef, subscriberData);
  } catch (error) {
    console.error(`Error updating subscriber with id ${id}:`, error);
    throw new Error(`Failed to update subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteSubscriberData(id: string): Promise<void> {
  try {
    const subscriberRef = doc(db, COLLECTIONS.SUBSCRIBERS, id);
    await deleteDoc(subscriberRef);
  } catch (error) {
    console.error(`Error deleting subscriber with id ${id}:`, error);
    throw new Error(`Failed to delete subscriber: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Booking Functions
export async function getBookings(filters?: {
  status?: 'pending' | 'confirmed' | 'cancelled';
  limitCount?: number;
}): Promise<Booking[]> {
  try {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const constraints: QueryConstraint[] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    constraints.push(orderBy('selectedDate', 'asc'));

    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = query(bookingsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, id);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return null;
    }

    return {
      id: bookingSnap.id,
      ...bookingSnap.data(),
    } as Booking;
  } catch (error) {
    console.error(`Error fetching booking with id ${id}:`, error);
    throw new Error(`Failed to fetch booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createBookingData(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<string> {
  try {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);

    const newBooking = {
      ...bookingData,
      createdAt: Timestamp.now(),
      status: bookingData.status ?? 'pending',
    };

    const docRef = await addDoc(bookingsRef, newBooking);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateBookingData(id: string, bookingData: Partial<Omit<Booking, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, id);
    await updateDoc(bookingRef, bookingData);
  } catch (error) {
    console.error(`Error updating booking with id ${id}:`, error);
    throw new Error(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteBookingData(id: string): Promise<void> {
  try {
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, id);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error(`Error deleting booking with id ${id}:`, error);
    throw new Error(`Failed to delete booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

    
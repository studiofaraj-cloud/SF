
'use server';

import { z } from 'zod';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import {
    createBlogData,
    updateBlogData,
    deleteBlogData,
    createProjectData,
    updateProjectData,
    deleteProjectData,
    createSubscriberData,
    getBlogs,
    getBlogById,
    getBlogBySlug,
    getProjects,
    getProjectById,
    getProjectBySlug,
    getMessages,
    getSubscribers,
    markMessageAsRead,
    markMessageAsUnread,
    deleteMessageData,
    getMessagesBySource,
    getBookings,
    createBookingData,
    updateBookingData,
    deleteBookingData,
    getHeroSlides,
    saveHeroSlides,
    type HeroSlideData,
} from './firestore-data';
import { Timestamp } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { uploadFile, type ImageMetadata } from './storage';

// Logout is now handled client-side in AdminHeader component using Firebase signOut
// This function is kept for backwards compatibility but is no longer used
export async function logout() {
  redirect('/admin/login');
}

// Helper function to convert Firestore Timestamps to ISO strings
function serializeFirestoreData(data: any): any {
    if (data === null || data === undefined) return data;
    
    if (data instanceof Timestamp) {
        return data.toDate().toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreData(item));
    }
    
    if (typeof data === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeFirestoreData(value);
        }
        return serialized;
    }
    
    return data;
}

// --- Public Data Fetching Actions ---
export async function getBlogsAction() {
    return unstable_cache(
        async () => {
            const blogs = await getBlogs();
            return blogs.map(blog => serializeFirestoreData(blog));
        },
        ['blogs-list'],
        { revalidate: 3600, tags: ['blogs'] }
    )();
}

export async function getBlogBySlugAction(slug: string) {
    // Validate slug before proceeding
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
        return null;
    }

    return unstable_cache(
        async () => {
            const blog = await getBlogBySlug(slug);
            return blog ? serializeFirestoreData(blog) : null;
        },
        [`blog-${slug}`],
        { revalidate: 3600, tags: ['blogs', `blog-${slug}`] }
    )();
}

export async function getProjectsAction() {
    return unstable_cache(
        async () => {
            const projects = await getProjects();
            return projects.map(project => serializeFirestoreData(project));
        },
        ['projects-list'],
        { revalidate: 7200, tags: ['projects'] }
    )();
}

export async function getProjectBySlugAction(slug: string) {
    // Validate slug before proceeding
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
        return null;
    }

    return unstable_cache(
        async () => {
            const project = await getProjectBySlug(slug);
            return project ? serializeFirestoreData(project) : null;
        },
        [`project-${slug}`],
        { revalidate: 7200, tags: ['projects', `project-${slug}`] }
    )();
}


// --- Admin Data Fetching Actions ---
export async function getAdminBlogsAction() {
    const blogs = await getBlogs();
    return blogs.map(blog => serializeFirestoreData(blog));
}

/** Uncached — always fetches fresh data for the admin edit form. */
export async function getAdminBlogBySlugAction(slug: string) {
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
        return null;
    }
    try {
        const blog = await getBlogBySlug(slug);
        return blog ? serializeFirestoreData(blog) : null;
    } catch (error) {
        console.error('Error fetching blog by slug:', slug, error);
        throw new Error(`Failed to fetch blog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getAdminProjectsAction() {
    const projects = await getProjects();
    return projects.map(project => serializeFirestoreData(project));
}

/** Uncached — always fetches fresh data for the admin edit form. */
export async function getAdminProjectBySlugAction(slug: string) {
    // Validate slug before proceeding
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
        return null;
    }

    try {
        const project = await getProjectBySlug(slug);
        return project ? serializeFirestoreData(project) : null;
    } catch (error) {
        console.error('Error fetching project by slug:', slug, error);
        throw new Error(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getMessagesAction(filters?: {
    source?: 'contact-form' | 'quote-dialog';
    read?: boolean;
    limitCount?: number;
}) {
    const messages = await getMessages(filters);
    return messages.map(message => serializeFirestoreData(message));
}

export async function markMessageAsReadAction(id: string) {
    try {
        await markMessageAsRead(id);
        revalidatePath('/admin/messages');
        revalidatePath('/admin');
        return { success: true, message: 'Message marked as read.' };
    } catch (error) {
        return { success: false, message: 'Failed to mark message as read.' };
    }
}

export async function markMessageAsUnreadAction(id: string) {
    try {
        await markMessageAsUnread(id);
        revalidatePath('/admin/messages');
        revalidatePath('/admin');
        return { success: true, message: 'Message marked as unread.' };
    } catch (error) {
        return { success: false, message: 'Failed to mark message as unread.' };
    }
}

export async function deleteMessageAction(id: string) {
    try {
        await deleteMessageData(id);
        revalidatePath('/admin/messages');
        revalidatePath('/admin');
        return { success: true, message: 'Message deleted.' };
    } catch (error) {
        return { success: false, message: 'Failed to delete message.' };
    }
}

export async function getSubscribersAction() {
    const subscribers = await getSubscribers();
    return subscribers.map(subscriber => serializeFirestoreData(subscriber));
}

export async function getDashboardStatsAction() {
    const blogs = await getBlogs();
    const projects = await getProjects();
    const messages = await getMessages();
    const subscribers = await getSubscribers();
    const bookings = await getBookings();
    return {
        totalBlogs: blogs.length,
        totalProjects: projects.length,
        totalMessages: messages.length,
        totalSubscribers: subscribers.length,
        totalBookings: bookings.length,
    };
}


const BlogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    excerpt: z.string().min(1, 'Excerpt is required'),
    content: z.string().min(1, 'Content is required'),
    featuredImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    gallery: z.array(z.string().url('Must be a valid URL')).optional().default([]),
    published: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
});

export async function createBlog(prevState: { message: string; errors?: any }, formData: FormData) {
    
    const validatedFields = BlogSchema.safeParse({
      title: formData.get('title'),
      slug: formData.get('slug'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      featuredImage: formData.get('featuredImage-url'),
      gallery: formData.getAll('gallery[]'),
      published: formData.get('published'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check the fields.',
        };
    }
    
    try {
        await createBlogData(validatedFields.data as any);
    } catch (error) {
        console.error('Firestore error:', error);
        return { message: 'Failed to create blog post.', errors: {} };
    }

    // Invalidate data cache + page cache
    revalidateTag('blogs');
    revalidatePath('/admin/blogs');
    for (const locale of ['it', 'en']) {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/blog`);
        if (validatedFields.data.slug) {
            revalidateTag(`blog-${validatedFields.data.slug}`);
            revalidatePath(`/${locale}/blog/${validatedFields.data.slug}`);
        }
    }
    redirect('/admin/blogs');
}

export async function updateBlog(id: string, prevState: { message: string; errors?: any }, formData: FormData) {
    
    const validatedFields = BlogSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        excerpt: formData.get('excerpt'),
        content: formData.get('content'),
        featuredImage: formData.get('featuredImage-url'),
        gallery: formData.getAll('gallery[]'),
        published: formData.get('published'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed.',
        };
    }
    
    try {
        await updateBlogData(id, validatedFields.data as any);
    } catch (error) {
        return { message: 'Failed to update blog post.', errors: {} };
    }

    // Invalidate data cache + page cache
    revalidateTag('blogs');
    revalidateTag(`blog-${validatedFields.data.slug}`);
    revalidatePath('/admin/blogs');
    revalidatePath(`/admin/blogs/edit/${validatedFields.data.slug}`);
    for (const locale of ['it', 'en']) {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/blog`);
        revalidatePath(`/${locale}/blog/${validatedFields.data.slug}`);
    }
    redirect('/admin/blogs');
}

export async function deleteBlog(id: string) {
    try {
        const blog = await getBlogById(id);

        // Note: With current schema, images are stored as URLs without storage paths
        // Image cleanup from Firebase Storage is handled separately if needed

        await deleteBlogData(id);
        revalidateTag('blogs');
        revalidatePath('/admin/blogs');
        for (const locale of ['it', 'en']) {
            revalidatePath(`/${locale}`);
            revalidatePath(`/${locale}/blog`);
        }
        return { message: 'Blog post deleted.' };
    } catch (error) {
        return { message: 'Failed to delete blog post.' };
    }
}


const ProjectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Description is required'),
    content: z.string().min(1, 'Content is required'),
    featuredImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    gallery: z.array(z.string().url()).optional().default([]),
    technologies: z.array(z.string()).optional().default([]),
    projectUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    category: z.string().optional(),
    clientName: z.string().optional(),
    metrics: z.array(z.object({
        label: z.string(),
        value: z.string(),
    })).optional().default([]),
    highlights: z.array(z.string()).optional().default([]),
    year: z.string().optional(),
    published: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
});

export async function createProject(prevState: { message: string; errors?: any }, formData: FormData) {
    
    // Parse metrics array
    const metricsLabels = formData.getAll('metrics[][label]');
    const metricsValues = formData.getAll('metrics[][value]');
    const metrics = metricsLabels.map((label, index) => ({
        label: label as string,
        value: metricsValues[index] as string || '',
    })).filter(m => m.label && m.value);
    
    const validatedFields = ProjectSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        description: formData.get('description'),
        content: formData.get('content'),
        featuredImage: formData.get('featuredImage-url'),
        gallery: formData.getAll('gallery[]'),
        technologies: formData.getAll('technologies[]'),
        projectUrl: formData.get('projectUrl') || '',
        githubUrl: formData.get('githubUrl') || '',
        category: formData.get('category') || '',
        clientName: formData.get('clientName') || '',
        metrics: metrics.length > 0 ? metrics : undefined,
        highlights: formData.getAll('highlights[]').filter(h => h) as string[],
        year: formData.get('year') || '',
        published: formData.get('published'),
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check the fields.',
        };
    }
    
    try {
        await createProjectData(validatedFields.data as any);
    } catch (error) {
        console.error('Firestore error:', error);
        return { message: 'Failed to create project.', errors: {} };
    }

    // Invalidate data cache + page cache
    revalidateTag('projects');
    revalidatePath('/admin/projects');
    for (const locale of ['it', 'en']) {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/projects`);
        if (validatedFields.data.slug) {
            revalidateTag(`project-${validatedFields.data.slug}`);
            revalidatePath(`/${locale}/projects/${validatedFields.data.slug}`);
        }
    }
    redirect('/admin/projects');
}

export async function updateProject(id: string, prevState: { message: string; errors?: any }, formData: FormData) {
    
    // Parse metrics array
    const metricsLabels = formData.getAll('metrics[][label]');
    const metricsValues = formData.getAll('metrics[][value]');
    const metrics = metricsLabels.map((label, index) => ({
        label: label as string,
        value: metricsValues[index] as string || '',
    })).filter(m => m.label && m.value);
    
    const validatedFields = ProjectSchema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        description: formData.get('description'),
        content: formData.get('content'),
        featuredImage: formData.get('featuredImage-url'),
        gallery: formData.getAll('gallery[]'),
        technologies: formData.getAll('technologies[]'),
        projectUrl: formData.get('projectUrl') || '',
        githubUrl: formData.get('githubUrl') || '',
        category: formData.get('category') || '',
        clientName: formData.get('clientName') || '',
        metrics: metrics.length > 0 ? metrics : undefined,
        highlights: formData.getAll('highlights[]').filter(h => h) as string[],
        year: formData.get('year') || '',
        published: formData.get('published'),
    });
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed.',
        };
    }

    try {
        await updateProjectData(id, validatedFields.data as any);
    } catch (error) {
        return { message: 'Failed to update project.', errors: {} };
    }

    // Invalidate data cache + page cache
    revalidateTag('projects');
    revalidateTag(`project-${validatedFields.data.slug}`);
    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/edit/${validatedFields.data.slug}`);
    for (const locale of ['it', 'en']) {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/projects`);
        revalidatePath(`/${locale}/projects/${validatedFields.data.slug}`);
    }
    redirect('/admin/projects');
}

export async function deleteProject(id: string) {
    try {
        const project = await getProjectById(id);

        // Note: With current schema, images are stored as URLs without storage paths
        // Image cleanup from Firebase Storage is handled separately if needed

        await deleteProjectData(id);
        revalidateTag('projects');
        revalidatePath('/admin/projects');
        for (const locale of ['it', 'en']) {
            revalidatePath(`/${locale}`);
            revalidatePath(`/${locale}/projects`);
        }
        return { message: 'Project deleted.' };
    } catch (error) {
        return { message: 'Failed to delete project.' };
    }
}

const SubscriberSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function createSubscriber(prevState: { message: string | null, success: boolean }, formData: FormData) {
  const validatedFields = SubscriberSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Indirizzo email non valido.',
      success: false,
    };
  }

  try {
    await createSubscriberData({ email: validatedFields.data.email, active: true });
  } catch (error) {
    return { message: (error as Error).message, success: false };
  }

  revalidatePath('/admin/subscribers');
  return { success: true, message: 'Iscrizione completata con successo!' };
}

// Booking Actions
const BookingSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  email: z.string().email('Indirizzo email non valido').optional().or(z.literal('')),
  phone: z.string().min(1, 'Il numero di telefono è obbligatorio'),
  selectedDate: z.string().min(1, 'La data è obbligatoria'),
  selectedTime: z.union([z.string(), z.array(z.string())]).optional(),
  message: z.string().optional(),
  source: z.string().optional(),
});

export async function createBooking(prevState: { message: string | null, success: boolean, errors?: any }, formData: FormData) {
  try {
    // Extract selectedTime as array (FormData can have multiple values with same key)
    const formEntries = Object.fromEntries(formData.entries());
    const selectedTimeValues = formData.getAll('selectedTime');
    
    // Convert to array if multiple values, or single string if one value, or undefined if none
    let selectedTime: string | string[] | undefined;
    if (selectedTimeValues.length > 0) {
      selectedTime = selectedTimeValues.length === 1 ? selectedTimeValues[0] : selectedTimeValues;
    }
    
    const validationData = {
      ...formEntries,
      selectedTime,
    };
    
    const validatedFields = BookingSchema.safeParse(validationData);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Validazione fallita. Controlla i campi.',
        success: false,
      };
    }

    // Convert date string to Timestamp
    const selectedDate = new Date(validatedFields.data.selectedDate);
    if (isNaN(selectedDate.getTime())) {
      return {
        message: 'Data non valida.',
        success: false,
      };
    }

    const bookingData = {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      phone: validatedFields.data.phone,
      selectedDate: Timestamp.fromDate(selectedDate),
      selectedTime: Array.isArray(validatedFields.data.selectedTime) 
        ? validatedFields.data.selectedTime 
        : validatedFields.data.selectedTime 
          ? [validatedFields.data.selectedTime] 
          : undefined,
      message: validatedFields.data.message,
      status: 'pending' as const,
      source: validatedFields.data.source || 'contact-section',
    };

    await createBookingData(bookingData);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin');
    
    return { 
      success: true, 
      message: 'Prenotazione creata con successo! Ti contatteremo presto.' 
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { 
      message: 'Si è verificato un errore. Riprova più tardi.', 
      success: false 
    };
  }
}

export async function getBookingsAction(filters?: {
  status?: 'pending' | 'confirmed' | 'cancelled';
  limitCount?: number;
}) {
  const bookings = await getBookings(filters);
  return bookings.map(booking => serializeFirestoreData(booking));
}

export async function updateBookingStatusAction(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
  try {
    await updateBookingData(id, { status });
    revalidatePath('/admin/bookings');
    revalidatePath('/admin');
    return { success: true, message: 'Stato prenotazione aggiornato.' };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, message: 'Errore nell\'aggiornamento dello stato.' };
  }
}

export async function deleteBookingAction(id: string) {
  try {
    await deleteBookingData(id);
    revalidatePath('/admin/bookings');
    revalidatePath('/admin');
    return { success: true, message: 'Prenotazione eliminata.' };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return { success: false, message: 'Errore nell\'eliminazione della prenotazione.' };
  }
}

// ─── Hero Slides Actions ───────────────────────────────────────────────────────

export async function getHeroSlidesAction(): Promise<HeroSlideData[]> {
  try {
    return await getHeroSlides();
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
}

export async function saveHeroSlidesAction(slides: HeroSlideData[]) {
  try {
    await saveHeroSlides(slides);
    revalidatePath('/', 'layout');
    return { success: true, message: 'Slides salvate con successo.' };
  } catch (error) {
    console.error('Error saving hero slides:', error);
    return { success: false, message: 'Errore nel salvataggio delle slides.' };
  }
}

    
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createMessageData } from './firestore-data';

// Explicit server action export to help Turbopack module resolution

const ContactMessageSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    service: z.string().optional(),
    budget: z.string().optional(),
    source: z.enum(['contact-form', 'quote-dialog']).optional(),
    message: z.string().min(1, 'Message is required'),
});

export async function createMessage(prevState: { message: string | null, success: boolean, errors?: any }, formData: FormData) {
    try {
        const formEntries = Object.fromEntries(formData.entries());
        
        // Log form data for debugging (remove sensitive data in production)
        console.log('[createMessage] Form data received:', {
            name: formEntries.name,
            email: formEntries.email,
            phone: formEntries.phone,
            service: formEntries.service,
            budget: formEntries.budget,
            source: formEntries.source,
            hasMessage: !!formEntries.message,
        });
        
        // Auto-detect source if not provided: if budget exists, it's likely a quote request
        if (!formEntries.source && formEntries.budget) {
            formEntries.source = 'quote-dialog';
        } else if (!formEntries.source) {
            formEntries.source = 'contact-form';
        }
        
        const validatedFields = ContactMessageSchema.safeParse(formEntries);

        if (!validatedFields.success) {
            console.error('[createMessage] Validation failed:', validatedFields.error.flatten().fieldErrors);
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'validationFailed',
                success: false,
            };
        }

        try {
            console.log('[createMessage] Attempting to save message to database...');
            const messageId = await createMessageData(validatedFields.data as any);
            console.log('[createMessage] Message saved successfully with ID:', messageId);
        } catch (error) {
            console.error('[createMessage] Error creating message:', error);
            // Provide more specific error messages
            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('denied')) {
                    console.error('[createMessage] Permission error detected');
                    return { 
                        message: 'permissionError', 
                        success: false 
                    };
                }
                if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
                    console.error('[createMessage] Network error detected');
                    return { 
                        message: 'networkError', 
                        success: false 
                    };
                }
                if (errorMessage.includes('failed to create message')) {
                    console.error('[createMessage] Database creation error:', error.message);
                    return { 
                        message: 'dbError', 
                        success: false 
                    };
                }
                // Log the full error for debugging
                console.error('[createMessage] Unknown error:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                });
            }
            return { 
                message: 'dbError', 
                success: false 
            };
        }

        revalidatePath('/admin/messages');
        console.log('[createMessage] Message created successfully, revalidating paths');
        return { success: true, message: 'successCreated' };
    } catch (error) {
        console.error('[createMessage] Unexpected error:', error);
        // Log full error details for debugging
        if (error instanceof Error) {
            console.error('[createMessage] Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
            });
        }
        return { 
            message: 'unexpectedError', 
            success: false 
        };
    }
}

const PlanRequestSchema = z.object({
    email: z.string().email('Indirizzo email non valido'),
    planName: z.string().min(1, 'Nome del piano mancante'),
    planPrice: z.string().min(1, 'Prezzo del piano mancante'),
    serviceName: z.string().min(1, 'Nome del servizio mancante'),
});

export async function submitPlanRequest(prevState: { message: string | null, success: boolean, errors?: any }, formData: FormData) {
    try {
        const validatedFields = PlanRequestSchema.safeParse({
            email: formData.get('email'),
            planName: formData.get('planName'),
            planPrice: formData.get('planPrice'),
            serviceName: formData.get('serviceName'),
        });

        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'emailValidationFailed',
                success: false,
            };
        }

        const messageDto = {
            name: 'Nuovo Lead (Richiesta Piano Pagamento)',
            email: validatedFields.data.email,
            phone: '',
            service: validatedFields.data.serviceName,
            subject: `🔥 Richiesta Pagamento Piano: ${validatedFields.data.planName}`,
            budget: validatedFields.data.planPrice,
            source: 'plan-request',
            message: `Un utente ha richiesto il link di pagamento per il piano "${validatedFields.data.planName}" riferito al servizio di ${validatedFields.data.serviceName}.\n\n✅ Prezzo indicato nell'offerta: €${validatedFields.data.planPrice}\n✉️ Contattalo all'email: ${validatedFields.data.email} per inviargli il link e procedere col setup!`,
        };

        await createMessageData(messageDto as any);
        
        revalidatePath('/admin/messages');
        return { success: true, message: 'successPlanRequest' };

    } catch (error) {
        console.error('[submitPlanRequest] Unexpected error:', error);
        return { 
            message: 'unexpectedError', 
            success: false 
        };
    }
}

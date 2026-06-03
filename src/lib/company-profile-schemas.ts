/**
 * Plain TypeScript / Zod schemas shared between server actions and client
 * forms. Kept out of the `'use server'` actions file because Next.js requires
 * those files to only export async functions.
 */

import { z } from 'zod';
import { checkVAT, countries as JSVAT_COUNTRIES } from 'jsvat-next';
import { validateSlug } from '@/lib/company-slugs';

export const EU_COUNTRY_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const SlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine((s) => validateSlug(s) === null, {
    message: 'Slug must be 3-50 chars, kebab-case, and not a reserved word.',
  });

const TaxIdSchema = z
  .object({
    country: z.string().trim().toUpperCase().length(2),
    value: z.string().trim().min(1, 'Tax ID is required.').max(40),
    type: z.enum(['EU_VAT', 'IT_PIVA', 'OTHER']),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'OTHER') {
      if (!/^[A-Za-z0-9\- ]{4,40}$/.test(data.value)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Tax ID must be 4-40 alphanumeric characters.',
          path: ['value'],
        });
      }
      return;
    }
    const candidate = data.value.toUpperCase().startsWith(data.country)
      ? data.value.toUpperCase()
      : `${data.country}${data.value.toUpperCase()}`;
    const result = checkVAT(candidate, JSVAT_COUNTRIES);
    if (!result.isValidFormat) {
      ctx.addIssue({
        code: 'custom',
        message: 'VAT format is invalid for the selected country.',
        path: ['value'],
      });
    } else if (data.type === 'EU_VAT' && !result.isValid) {
      ctx.addIssue({
        code: 'custom',
        message: 'VAT checksum failed — please double-check the number.',
        path: ['value'],
      });
    }
  });

const ServiceSchema = z.object({
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(200).optional(),
  icon: z.string().trim().max(40).optional(),
});

const StatSchema = z.object({
  label: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(40),
});

const PointSchema = z.object({
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(200).optional(),
});

const ContactSchema = z.object({
  email: z.string().trim().email().or(z.literal('')).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z
    .string()
    .trim()
    .url('Website must be a valid URL.')
    .or(z.literal(''))
    .optional(),
  addressLine: z.string().trim().max(200).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
});

const SocialSchema = z.object({
  instagram: z.string().trim().max(120).optional(),
  linkedin: z.string().trim().max(120).optional(),
  facebook: z.string().trim().max(120).optional(),
  x: z.string().trim().max(120).optional(),
  youtube: z.string().trim().max(120).optional(),
  tiktok: z.string().trim().max(120).optional(),
});

const InvoicingSchema = z.object({
  // Codice destinatario SDI is 7 alphanumeric chars (e.g. M5UXCR1). Allow
  // empty to mean "use the universal fallback 0000000".
  sdiCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{7}$/, 'Il Codice SDI deve essere di 7 caratteri alfanumerici.')
    .or(z.literal(''))
    .optional(),
  pecEmail: z
    .string()
    .trim()
    .email('PEC non valida.')
    .or(z.literal(''))
    .optional(),
});

export const CompanyProfileInputSchema = z.object({
  slug: SlugSchema,
  companyName: z.string().trim().min(1, 'Company name is required.').max(120),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(1400, 'Description must be 1400 chars or less.').optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  heroUrl: z.string().url().or(z.literal('')).optional(),
  services: z.array(ServiceSchema).max(20).optional(),
  stats: z.array(StatSchema).max(12).optional(),
  pointsOfStrength: z.array(PointSchema).max(3, 'Maximum 3 points of strength.').optional(),
  contact: ContactSchema.optional(),
  social: SocialSchema.optional(),
  taxId: TaxIdSchema.optional(),
  taxIdPublic: z.boolean().default(true),
  numberOfEmployees: z.number().int().min(1).max(1_000_000).optional(),
  invoicing: InvoicingSchema.optional(),
});

export type CompanyProfileInput = z.infer<typeof CompanyProfileInputSchema>;

export interface ConsentInput {
  tosAccepted: boolean;
  marketingConsent: boolean;
}

export type UpdateCompanyProfileResult =
  | { success: true; slug: string; profileId: string }
  | { success: false; error: string; field?: string };

export type SubscriptionActionResult =
  | { success: true; url: string }
  | { success: false; error: string };

export interface AdminCompanyProfileSummary {
  id: string;
  slug: string;
  companyName: string;
  ownerUid: string;
  ownerEmail?: string;
  adminManaged: boolean;
  isPublished: boolean;
  subscriptionStatus?: string;
  updatedAt: string;
}

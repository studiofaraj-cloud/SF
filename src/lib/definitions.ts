

export type ImageMetadata = {
  url: string;
  name: string;
  size: number;
  path: string;
};

export type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  gallery?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  featuredImage: string;
  gallery: string[];
  technologies?: string[];
  projectUrl?: string;
  githubUrl?: string;
  category?: string;
  clientName?: string;
  metrics?: {
    label: string;
    value: string;
  }[];
  highlights?: string[];
  year?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  service?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  selectedDate: string;
  selectedTime?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  source?: string;
};

export type HeroSlide = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const navItems = [
  { href: '/', label: 'Home' },
  { href: '/chi-siamo', label: 'Chi Siamo' },
  { href: '/#services', label: 'Servizi' },
  { href: '/projects', label: 'Progetti' },
  { href: '/blog', label: 'Blog' },
  { href: '/contatti', label: 'Contatti' },
];

export type ContactService = {
  value: string;
  label: string;
};

export const contactServices: ContactService[] = [
  { value: 'sviluppo-web', label: 'Sviluppo Web' },
  { value: 'e-commerce', label: 'E-commerce' },
  { value: 'design-ui-ux', label: 'Design UI/UX' },
  { value: 'manutenzione', label: 'Manutenzione e Supporto' },
  { value: 'ai-automazione', label: 'AI & Automazione' },
  { value: 'seo-marketing', label: 'SEO & Web Marketing' },
  { value: 'hosting-cloud', label: 'Hosting & Cloud' },
  { value: 'consulenza', label: 'Consulenza Strategica' },
  { value: 'altro', label: 'Altro' },
];


    
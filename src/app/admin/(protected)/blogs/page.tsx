
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getBlogsAction } from '@/lib/actions';
import { PageHeader } from '@/components/admin/page-header';
import { BlogsDataTable } from './data-table';

export default async function AdminBlogsPage() {
  let blogs = [];
  let error = null;

  try {
    blogs = await getBlogsAction();
  } catch (err) {
    console.error('Failed to fetch blogs:', err);
    error = 'Unable to load blogs. Please try again later.';
  }

  return (
    <>
      <PageHeader
        title="Articoli Blog"
        description="Gestisci tutti i tuoi articoli qui."
      >
        <Button asChild>
          <Link href="/admin/blogs/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Crea Nuovo
          </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>I Tuoi Articoli</CardTitle>
          <CardDescription>
            Una lista di tutti gli articoli del blog nel tuo account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-600 p-4 bg-red-50 rounded">
              {error}
            </div>
          ) : (
            <BlogsDataTable blogs={blogs} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

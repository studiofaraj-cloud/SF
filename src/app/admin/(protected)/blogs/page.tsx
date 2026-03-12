
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
  const blogs = await getBlogsAction();

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
          <BlogsDataTable blogs={blogs} />
        </CardContent>
      </Card>
    </>
  );
}

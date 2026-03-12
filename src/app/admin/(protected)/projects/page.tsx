
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
import { getProjectsAction } from '@/lib/actions';
import { PageHeader } from '@/components/admin/page-header';
import { ProjectsDataTable } from './data-table';

export default async function AdminProjectsPage() {
  const projects = await getProjectsAction();

  return (
    <>
      <PageHeader
        title="Progetti"
        description="Gestisci tutti i tuoi progetti qui."
      >
        <Button asChild>
          <Link href="/admin/projects/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Crea Nuovo
          </Link>
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>I Tuoi Progetti</CardTitle>
          <CardDescription>
            Una lista di tutti i progetti nel tuo account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectsDataTable projects={projects} />
        </CardContent>
      </Card>
    </>
  );
}

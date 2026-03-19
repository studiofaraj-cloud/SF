
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Project } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { deleteProject } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';


function DeleteAction({ id, title }: { id: string; title: string }) {
  const { toast } = useToast();
  const deleteProjectWithId = async () => {
    const result = await deleteProject(id);
    if (result?.message) {
      toast({ title: 'Successo', description: result.message });
    }
  };

  return (
    <form action={deleteProjectWithId}>
      <button type="submit" className="w-full text-left" aria-label={`Elimina progetto: ${title}`}>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Elimina
        </DropdownMenuItem>
      </button>
    </form>
  );
}

export function ProjectsDataTable({ projects }: { projects: Project[] }) {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden w-[100px] sm:table-cell">
              <span className="sr-only">Immagine</span>
            </TableHead>
            <TableHead>Titolo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="hidden md:table-cell">Creato il</TableHead>
            <TableHead>
              <span className="sr-only">Azioni</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  alt=""
                  className="aspect-square rounded-md object-cover"
                  height="64"
                  src={project.featuredImage || "/placeholder.svg"}
                  width="64"
                  data-ai-hint="abstract design"
                  aria-hidden="true"
                />
              </TableCell>
              <TableCell className="font-medium">{project.title}</TableCell>
              <TableCell>
                <Badge className={project.published ? 'bg-green-600 text-white border-transparent' : 'bg-yellow-500 text-black border-transparent'}>
                  {project.published ? 'Pubblicato' : 'Bozza'}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(project.createdAt).toLocaleDateString('it-IT')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Azioni per {project.title}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/projects/edit/${project.slug}`}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Modifica
                      </Link>
                    </DropdownMenuItem>
                    <DeleteAction id={project.id} title={project.title} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

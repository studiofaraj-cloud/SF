
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Blog } from '@/lib/definitions';
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
import { deleteBlog } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

function DeleteAction({ id, title }: { id: string; title: string }) {
  const { toast } = useToast();
  const deleteBlogWithId = async () => {
    const result = await deleteBlog(id);
    if (result?.message) {
      toast({ title: 'Successo', description: result.message });
    }
  };

  return (
    <form action={deleteBlogWithId}>
      <button type="submit" className="w-full text-left" aria-label={`Elimina articolo: ${title}`}>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Elimina
        </DropdownMenuItem>
      </button>
    </form>
  );
}

export function BlogsDataTable({ blogs }: { blogs: Blog[] }) {
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
          {blogs.map((blog) => (
            <TableRow key={blog.id}>
              <TableCell className="hidden sm:table-cell">
                <Image
                  alt=""
                  className="aspect-square rounded-md object-cover"
                  height="64"
                  src={blog.featuredImage || "/placeholder.svg"}
                  width="64"
                  data-ai-hint="abstract image"
                  aria-hidden="true"
                />
              </TableCell>
              <TableCell className="font-medium">{blog.title}</TableCell>
              <TableCell>
                <Badge variant={blog.published ? 'default' : 'secondary'}>
                  {blog.published ? 'Pubblicato' : 'Bozza'}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(blog.createdAt).toLocaleDateString('it-IT')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Azioni per {blog.title}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/blogs/edit/${blog.slug}`}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Modifica
                      </Link>
                    </DropdownMenuItem>
                    <DeleteAction id={blog.id} title={blog.title} />
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

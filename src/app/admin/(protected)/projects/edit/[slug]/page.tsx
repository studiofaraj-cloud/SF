import EditProjectClient from '@/components/admin/edit-project-client';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { slug } = await params;
  return <EditProjectClient slug={slug} />;
}

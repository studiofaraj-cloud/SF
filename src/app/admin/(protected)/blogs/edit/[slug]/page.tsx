import EditBlogClient from '@/components/admin/edit-blog-client';

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EditBlogClient slug={slug} />;
}

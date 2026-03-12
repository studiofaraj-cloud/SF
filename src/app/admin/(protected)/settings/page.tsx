
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { HeroSlidesEditor } from '@/components/admin/hero-slides-editor';
import { getHeroSlidesAction } from '@/lib/actions';

export default async function SettingsPage() {
  const slides = await getHeroSlidesAction();

  return (
    <div className="grid flex-1 items-start gap-4">
      <PageHeader
        title="Site Settings"
        description="Manage global content for your website."
      />

      <Card>
        <CardHeader>
          <CardTitle>Hero Section Slides</CardTitle>
          <CardDescription>
            Manage the background images and text for the rotating hero section on the
            homepage. Images are stored in Firebase Storage. Drag slides to reorder
            them, add as many as you like, then press &ldquo;Save Slides&rdquo;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HeroSlidesEditor initialSlides={slides} />
        </CardContent>
      </Card>
    </div>
  );
}

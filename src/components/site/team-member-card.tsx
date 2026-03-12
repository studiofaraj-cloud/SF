
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TeamMemberCardProps = {
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
    imageHint: string;
};

export function TeamMemberCard({ name, role, bio, imageUrl, imageHint }: TeamMemberCardProps) {
    return (
        <Card className="text-center group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
            <div className="relative aspect-square">
                <Image
                    src={imageUrl}
                    alt={`Foto di ${name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={imageHint}
                />
            </div>
            <CardHeader>
                <CardTitle className="text-xl text-primary">{name}</CardTitle>
                <p className="text-sm text-primary font-medium">{role}</p>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{bio}</p>
            </CardContent>
        </Card>
    );
}

    

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle } from "lucide-react";

interface VideoEmbedProps {
  url: string;
  onWatched: () => void;
}

function getEmbedUrl(url: string): string | null {
  // YouTube: various formats
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export function VideoEmbed({ url, onWatched }: VideoEmbedProps) {
  const [watched, setWatched] = useState(false);
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          <p>Unable to load video. Please contact the waiver sender.</p>
        </CardContent>
      </Card>
    );
  }

  const handleConfirmWatched = () => {
    setWatched(true);
    onWatched();
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Play className="h-4 w-4" />
          Required: Watch the safety video before signing
        </div>
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Safety video"
          />
        </div>
        {!watched ? (
          <Button onClick={handleConfirmWatched} variant="outline" className="w-full gap-2">
            <CheckCircle className="h-4 w-4" />
            I have watched the video
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4" />
            Video watched
          </div>
        )}
      </CardContent>
    </Card>
  );
}

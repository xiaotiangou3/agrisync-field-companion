import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Loader2, AlertTriangle, Bug, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { addAlert, type AlertType } from '@/lib/alerts-store';
import { toast } from '@/hooks/use-toast';

interface BugResult {
  name: string;
  scientificName: string;
  confidence: number;
  isInvasive: boolean;
  description: string;
  threatLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
}

export default function BugIdentifier({ onAlertAdded }: { onAlertAdded?: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BugResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const identify = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('identify-bug', {
        body: { image },
      });
      if (error) throw error;
      const bugResult = data as BugResult;
      setResult(bugResult);

      if (bugResult.isInvasive) {
        // Auto-report to community
        addAlert({
          latitude: 28.6139 + (Math.random() - 0.5) * 0.01,
          longitude: 77.209 + (Math.random() - 0.5) * 0.01,
          crop_type: 'Multiple',
          alert_type: 'pest' as AlertType,
          description: `⚠️ INVASIVE: ${bugResult.name} (${bugResult.scientificName}) detected via photo ID. Confidence: ${bugResult.confidence}%`,
        });
        onAlertAdded?.();
        toast({
          title: '⚠️ Invasive Species Alert Sent',
          description: `Nearby farmers have been alerted about ${bugResult.name}.`,
        });
      }
    } catch (e: any) {
      toast({ title: 'Identification failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const threatStyles: Record<string, string> = {
    critical: 'bg-destructive/10 border-destructive/30',
    high: 'bg-destructive/10 border-destructive/20',
    moderate: 'bg-accent/10 border-accent/30',
    low: 'bg-muted border-border',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <Camera className="h-5 w-5 text-primary" />
          Bug Identifier
        </CardTitle>
        <p className="text-xs text-muted-foreground">Upload a photo of a bug for AI identification</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!image ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to upload or take a photo</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden">
              <img src={image} alt="Uploaded bug" className="w-full max-h-[250px] object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-medium">Analyzing with AI…</span>
                  </div>
                </div>
              )}
            </div>

            {!result && !loading && (
              <div className="flex gap-2">
                <Button onClick={identify} className="flex-1">
                  <Bug className="h-4 w-4 mr-1" /> Identify Bug
                </Button>
                <Button variant="outline" onClick={reset}>Reset</Button>
              </div>
            )}

            {result && (
              <div className={`rounded-lg border p-4 space-y-3 ${threatStyles[result.threatLevel]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold font-heading text-base">{result.name}</h3>
                    <p className="text-xs italic text-muted-foreground">{result.scientificName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={result.isInvasive ? 'destructive' : 'secondary'} className="text-[10px]">
                      {result.isInvasive ? '⚠️ INVASIVE' : 'Native'}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{result.confidence}% confidence</span>
                  </div>
                </div>

                <p className="text-sm text-foreground/80">{result.description}</p>

                {result.isInvasive && (
                  <div className="flex items-center gap-2 text-xs text-destructive font-medium bg-destructive/10 rounded-md p-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Community alert has been automatically sent to nearby farmers
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</span>
                    <ul className="space-y-1">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="text-xs flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={reset} className="w-full mt-2">
                  Scan Another Bug
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

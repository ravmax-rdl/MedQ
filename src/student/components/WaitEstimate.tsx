import { Clock } from 'lucide-react';

interface Props {
  estimatedWaitMins: number | null;
  position: number;
}

export default function WaitEstimate({ estimatedWaitMins, position }: Props) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Clock className="size-3.5 shrink-0 text-sky-500" />
      {estimatedWaitMins != null ? (
        <span>
          Est. wait{' '}
          <strong className="text-foreground font-semibold">~{estimatedWaitMins} min</strong>
        </span>
      ) : (
        <span>
          Position{' '}
          <strong className="text-foreground font-semibold">#{position}</strong> in queue
        </span>
      )}
    </div>
  );
}

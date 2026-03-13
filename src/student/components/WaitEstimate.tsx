import { Clock } from 'lucide-react';

interface Props {
  estimatedWaitMins: number | null;
  position: number;
}

export default function WaitEstimate({ estimatedWaitMins, position }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="size-4 shrink-0" />
      {estimatedWaitMins != null ? (
        <span>
          Estimated wait: <strong className="text-foreground">~{estimatedWaitMins} min</strong>
        </span>
      ) : (
        <span>
          You are position <strong className="text-foreground">#{position}</strong> in the queue
        </span>
      )}
    </div>
  );
}

import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Alert variant="destructive" className="w-11/12 max-w-lg">
        <AlertDescription className="space-y-4">
          <h3 className="text-lg font-bold">Error</h3>
          <p>{error?.message}</p>
          <Button
            variant="destructive"
            onClick={() => {
              resetErrorBoundary();
              window.location.reload();
            }}
          >
            Reload and try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

ErrorFallback.displayName = 'ErrorFallback';

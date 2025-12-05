'use client';

import { useAtom } from 'jotai';
import { Check, Cpu } from 'lucide-react';
import { useCallback } from 'react';

import { modelAtom } from '@/app/page';
import { setItem } from '@/app/utils/localStorage';
import { models } from '@/app/utils/models';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModelsProps {
  focusTextarea: () => void;
}

export const Models = ({ focusTextarea }: ModelsProps) => {
  const [model, setModel] = useAtom(modelAtom);

  const handleClick = useCallback(
    (selectedModel: string) => {
      if (
        confirm(
          `Are you sure you want to switch the model to ${selectedModel}?`
        )
      ) {
        setItem('model', selectedModel);
        setModel(selectedModel);
        focusTextarea();
      }
    },
    [setModel, focusTextarea]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Cpu className="size-4" />
          Model
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        <ScrollArea className="h-[400px]">
          {models.map((m) => (
            <DropdownMenuItem
              key={m.name}
              onClick={() => handleClick(m.name)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{m.displayName}</span>
              {model === m.name && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Models;

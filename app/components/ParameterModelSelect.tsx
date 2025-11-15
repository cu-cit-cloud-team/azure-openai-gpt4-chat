import { useAtom } from 'jotai';
import { memo, useCallback } from 'react';

import { parametersAtom } from '@/app/page';
import { getItem, setItem } from '@/app/utils/localStorage';
import { models } from '@/app/utils/models';

interface ParameterModelSelectProps {
  onCloseMenu?: () => void;
  focusTextarea: () => void;
}

export const ParameterModelSelect = memo(
  ({ onCloseMenu, focusTextarea }: ParameterModelSelectProps) => {
    const [parameters, setParameters] = useAtom(parametersAtom);

    const modelChangeHandler = useCallback(
      async (event) => {
        if (
          confirm(
            `Are you sure you want to switch the model to ${event.target.value}?`
          )
        ) {
          // Persist to localStorage first with correct spread order
          setItem('parameters', {
            ...getItem('parameters'),
            model: event.target.value,
          });
          // Update Jotai atom with correct spread order
          setParameters({ ...parameters, model: event.target.value });
          // Keep existing messages - new model will be used for future responses
        } else {
          event.target.value = parameters.model;
        }
        onCloseMenu?.();
        focusTextarea();
      },
      [parameters, setParameters, onCloseMenu, focusTextarea]
    );
    return (
      <>
        <span className="px-0 text-sm font-normal text-left">model:</span>
        <select
          className="w-full max-w-xs text-xs select select-sm select-bordered"
          id="model"
          value={parameters.model}
          onChange={modelChangeHandler}
        >
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.displayName}
            </option>
          ))}
        </select>
      </>
    );
  }
);

ParameterModelSelect.displayName = 'ModelSelect';

export default ParameterModelSelect;

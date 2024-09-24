import { useAtom } from 'jotai';
import { memo, useCallback } from 'react';

import { parametersAtom } from '@/app/components/Parameters';

export const ParameterModelSelect = memo(() => {
  const [parameters, setParameters] = useAtom(parametersAtom);

  const modelChangeHandler = useCallback(
    async (event) => {
      if (
        confirm(
          `Are you sure you want to switch the model to ${event.target.value}?`
        )
      ) {
        setParameters({ ...parameters, model: event.target.value });
        window.location.reload();
      } else {
        event.target.value = parameters.model;
      }
    },
    [parameters, setParameters]
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
        <option value="gpt-35-turbo">gpt-35-turbo (1106)</option>
        <option value="gpt-4">gpt-4 (1106)</option>
        <option value="gpt-4-turbo">gpt-4-turbo (2024-04-09)</option>
        <option value="gpt-4o">gpt-4o (2024-08-06)</option>
        <option value="gpt-4o-mini">gpt-4o-mini (2024-07-18)</option>
      </select>
    </>
  );
});

ParameterModelSelect.displayName = 'ModelSelect';

export default ParameterModelSelect;

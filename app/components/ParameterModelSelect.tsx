import { useAtom } from 'jotai';
import { memo, useCallback } from 'react';

import { parametersAtom } from '@/app/components/Parameters';

import { models } from '@/app/utils/models';

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
        {models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.displayName}
          </option>
        ))}
      </select>
    </>
  );
});

ParameterModelSelect.displayName = 'ModelSelect';

export default ParameterModelSelect;

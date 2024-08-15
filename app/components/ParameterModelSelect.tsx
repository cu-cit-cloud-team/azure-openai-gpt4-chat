import { useAtom, useAtomValue } from 'jotai';
import { memo, useCallback, useEffect } from 'react';

import { database } from '@/app/database/database.config';

import { parametersAtom } from '@/app/components/Parameters';
import { gpt4oMiniEnabledAtom } from '@/app/page';

export const ParameterModelSelect = memo(() => {
  const [parameters, setParameters] = useAtom(parametersAtom);
  const gpt4oMiniEnabled = useAtomValue(gpt4oMiniEnabledAtom);

  const modelChangeHandler = useCallback(
    async (event) => {
      if (
        confirm(
          'Changing the model will reset the chat history. Are you sure you want to continue?'
        )
      ) {
        setParameters({ ...parameters, model: event.target.value });
        try {
          await database.messages.clear();
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      } else {
        event.target.value = parameters.model;
      }
    },
    [parameters, setParameters]
  );

  useEffect(() => {
    if (!gpt4oMiniEnabled && parameters.model === 'gpt-4o-mini') {
      setParameters({ ...parameters, model: 'gpt-4o' });
    }
  }, [gpt4oMiniEnabled, parameters, setParameters]);

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
        <option value="gpt-4o">gpt-4o (2024-05-13)</option>
        <option value="gpt-4o-mini" disabled={!gpt4oMiniEnabled}>
          gpt-4o-mini (2024-07-18)
        </option>
      </select>
    </>
  );
});

ParameterModelSelect.displayName = 'ModelSelect';

export default ParameterModelSelect;

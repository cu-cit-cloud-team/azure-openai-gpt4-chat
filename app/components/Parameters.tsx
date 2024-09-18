import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { memo } from 'react';

import { ParameterModelSelect } from '@/app/components/ParameterModelSelect';
import { ParameterSlider } from '@/app/components/ParameterSlider';

const AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT =
  process.env.AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT;

export const gpt4oMiniEnabledAtom = atom(() => {
  return (
    AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT &&
    AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT.trim().length > 4
  );
});
export const parametersAtom = atomWithStorage('parameters', {
  model: 'gpt-4o',
  temperature: '1',
  top_p: '1',
  frequency_penalty: '0',
  presence_penalty: '0',
});

export const Parameters = memo(() => {
  return (
    <details>
      <summary>
        <FontAwesomeIcon icon={faSliders} />
        Parameters
      </summary>
      <ul className="bg-base-200">
        <li className="text-xs">
          <ParameterModelSelect />
        </li>
        <li className="text-xs">
          <ParameterSlider
            paramName={'temperature'}
            min={0}
            max={2}
            step={0.1}
          />
        </li>
        <li className="text-xs">
          <ParameterSlider paramName={'top_p'} min={0} max={1} step={0.1} />
        </li>
        <li className="text-xs">
          <ParameterSlider
            paramName={'frequency_penalty'}
            min={-2}
            max={2}
            step={0.1}
          />
        </li>
        <li className="text-xs">
          <ParameterSlider
            paramName={'presence_penalty'}
            min={-2}
            max={2}
            step={0.1}
          />
        </li>
      </ul>
    </details>
  );
});

Parameters.displayName = 'Parameters';

export default Parameters;

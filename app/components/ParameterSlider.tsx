import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import propTypes from 'prop-types';
import { memo, useCallback } from 'react';

import { getItem, setItem } from '@/app/utils/localStorage';

import { parametersAtom } from '@/app/components/Parameters';

export const ParameterSlider = memo(
  ({ paramName, displayName = null, min = 0, max = 1, step = 0.1 }) => {
    const [parameters, setParameters] = useAtom(parametersAtom);

    const paramDetails = (param) => {
      const map = {
        temperature:
          'What sampling temperature to use, between 0 and 2. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer. We generally recommend altering this or top_p but not both. Default is 1.',
        top_p:
          'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend altering this or temperature but not both. Default is 1.',
        frequency_penalty:
          "Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics. Default is 0.",
        presence_penalty:
          "Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. Default is 0.",
      };

      return map[param];
    };

    const newKey = useCallback(() => nanoid(), []);

    return (
      <>
        <span
          className="px-0 text-xs font-normal text-left tooltip tooltip-bottom"
          data-tip={paramDetails(paramName)}
        >
          {displayName || paramName}:{' '}
          <span className="font-bold">{parameters[paramName]}</span>
        </span>
        <input
          type="range"
          min={min}
          max={max}
          value={parameters[paramName]}
          className="px-0 range range-xs"
          step={step}
          name={paramName}
          onChange={(e) => {
            setItem('parameters', {
              ...getItem('parameters'),
              [paramName]: e.target.value,
            });
            setParameters({
              ...parameters,
              [paramName]: e.target.value,
            });
          }}
        />
        <div className="flex justify-between w-full px-2 text-xs !menu:hover">
          {Array.from({ length: max / step + 1 }, (_, i) => i).map(() => (
            <span className="text-xs" key={newKey()}>
              |
            </span>
          ))}
        </div>
      </>
    );
  }
);

ParameterSlider.displayName = 'ParameterSlider';
ParameterSlider.propTypes = {
  paramName: propTypes.string.isRequired,
  displayName: propTypes.string,
  min: propTypes.number,
  max: propTypes.number,
  step: propTypes.number,
};

export default ParameterSlider;

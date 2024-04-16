import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { ParameterModelSelect } from '@/app/components/ParameterModelSelect.tsx';
import { ParameterSlider } from '@/app/components/ParameterSlider.tsx';

export const Parameters = memo(({ clearHistory }) => {
  return (
    <details>
      <summary>
        <FontAwesomeIcon icon={faSliders} />
        Parameters
      </summary>
      <ul className="bg-base-200">
        <li className="text-xs">
          <ParameterModelSelect clearHistory={clearHistory} />
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

Parameters.propTypes = {
  clearHistory: PropTypes.func.isRequired,
};

export default Parameters;

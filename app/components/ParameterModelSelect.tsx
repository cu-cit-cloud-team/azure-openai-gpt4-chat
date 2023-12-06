import PropTypes from 'prop-types';
import { React, useEffect, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export const ParameterModelSelect = ({ clearHistory }) => {
  const [parameters, setParameters] = useLocalStorageState('parameters', {
    defaultValue: {
      model: 'gpt-4',
      temperature: '1',
      top_p: '1',
      frequency_penalty: '0',
      presence_penalty: '0',
    },
  });

  const modelChangeHandler = (event) => {
    if (
      confirm(
        'Changing the model will reset the chat history. Are you sure you want to continue?'
      )
    ) {
      window.localStorage.setItem(
        'parameters',
        JSON.stringify({
          ...JSON.parse(window.localStorage.getItem('parameters')),
          model: event.target.value,
        })
      );
      window.dispatchEvent(new Event('storage'));
      setParameters({ ...parameters, model: event.target.value });
      clearHistory(false);
    } else {
      event.target.value = parameters.model;
    }
  };

  useEffect(() => {
    if (parameters.model !== 'gpt-4' && parameters.model !== 'gpt-35-turbo') {
      window.localStorage.setItem(
        'parameters',
        JSON.stringify({
          ...JSON.parse(window.localStorage.getItem('parameters')),
          model: 'gpt-4',
        })
      );
      window.dispatchEvent(new Event('storage'));
      setParameters({ ...parameters, model: 'gpt-4' });
    }
  }, [parameters, setParameters]);

  return (
    <>
      <span className="px-0 text-sm font-normal text-left">model:</span>
      <select
        className="w-full max-w-xs select select-bordered"
        value={parameters.model}
        onChange={(e) => modelChangeHandler(e)}
      >
        <option value="gpt-35-turbo">gpt-35-turbo (0613)</option>
        <option value="gpt-4">gpt-4-turbo (1106)</option>
      </select>
    </>
  );
};

ParameterModelSelect.displayName = 'ModelSelect';
ParameterModelSelect.propTypes = {
  clearHistory: PropTypes.func.isRequired,
};

export default ParameterModelSelect;

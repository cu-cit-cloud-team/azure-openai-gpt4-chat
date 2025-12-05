'use client';

import { faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAtom } from 'jotai';
import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { parametersAtom } from '@/app/page';
import { getItem, setItem } from '@/app/utils/localStorage';
import { models } from '@/app/utils/models';

interface ModelsProps {
  onOpen?: () => void;
  focusTextarea: () => void;
}

export const Models = ({ onOpen, focusTextarea }: ModelsProps) => {
  const [parameters, setParameters] = useAtom(parametersAtom);
  const modelListRef = useRef<HTMLUListElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const selectedModel = button.dataset.set_model as string;

      if (
        confirm(
          `Are you sure you want to switch the model to ${selectedModel}?`
        )
      ) {
        // Persist to localStorage first
        setItem('parameters', {
          ...getItem('parameters'),
          model: selectedModel,
        });
        // Update Jotai atom
        setParameters({ ...parameters, model: selectedModel });
        focusTextarea();
      }
    },
    [parameters, setParameters, focusTextarea]
  );

  const updateSelected = useCallback(() => {
    if (!modelListRef.current) {
      return;
    }

    // Find all model selection checkmarks within our model list
    const selectedSVGs =
      modelListRef.current.querySelectorAll('svg.modelSelected');
    for (const svg of selectedSVGs) {
      svg.classList.add('hidden');
    }

    const buttons = modelListRef.current.querySelectorAll(
      'button[data-set_model]'
    );
    for (const button of buttons) {
      if (
        (button as HTMLButtonElement).dataset.set_model === parameters.model
      ) {
        const svg = button.querySelector('svg');
        if (svg) {
          svg.classList.remove('hidden');
          svg.classList.add('visible');
          svg.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }
      }
    }
  }, [parameters.model]);

  useEffect(() => {
    updateSelected();
  }, [updateSelected]);

  return (
    <div title="Change Model" className="dropdown">
      <a tabIndex={0} role="button" onClick={onOpen}>
        <FontAwesomeIcon icon={faMicrochip} /> Model
      </a>
      <div
        tabIndex={0}
        className="dropdown-content bg-base-200 text-base-content rounded-box top-px min-h-112 max-h-[calc(100vh-10rem)] overflow-y-auto border border-white/5 shadow-2xl mt-12"
      >
        <ul
          ref={modelListRef}
          className="menu"
          style={{
            marginInlineStart: 'initial',
            paddingInlineStart: 'initial',
          }}
        >
          {models.map((model) => (
            <li key={model.name}>
              <button
                className="px-2 gap-3"
                data-set_model={model.name}
                type="button"
                onClick={handleClick}
              >
                <div className="w-48 text-left">{model.displayName}</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="modelSelected hidden h-3 w-3 shrink-0"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Models;

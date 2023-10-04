import PropTypes from 'prop-types';
import React from 'react';

import pkg from '../../package.json';

export const Header = ({ clickHandler }) => (
  <div className="fixed top-0 z-50 navbar bg-base-200">
    <div className="navbar-start">
      <a className="text-xl normal-case" href="/">
        Cloud Team GPT Chat v{pkg.version}{' '}
        <small className="text-sm">Powered by Azure OpenAI GPT-4</small>
      </a>
    </div>
    <div className="navbar-end">
      <button type="button" className="btn btn-neutral" onClick={clickHandler}>
        Clear History
      </button>
    </div>
  </div>
);

Header.displayName = 'Header';
Header.propTypes = {
  clickHandler: PropTypes.func.isRequired,
};

export default Header;

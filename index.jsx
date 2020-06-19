import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const widget = {
  initialize(id, column) {
    ReactDOM.render(<App defaultSort={column} />, document.getElementById(id));
  },
};

window.widget = widget;

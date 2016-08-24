import React from 'react';
import {render} from 'react-dom';
import RundownTable from './components/RundownTable/index.jsx';

render(
  <RundownTable socket={io()} />,
  document.getElementById('rundown-container')
);

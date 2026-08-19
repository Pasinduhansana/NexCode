import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';

const html = renderToString(
  React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(App))
);
console.log('RENDER_OK length=' + html.length);
if (!html.includes('NexCode')) {
  console.error('WARN: expected brand text not found in output');
  process.exit(2);
}
console.log('BRAND_PRESENT ok');

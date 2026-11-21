import React from 'react';
import { Link as RRLink } from 'react-router-dom';

export default function Link({ href, to, replace, onClick, className, children, ...rest }) {
  const target = href != null ? href : to;
  const props = target
    ? { to: target, replace, onClick, className, ...rest }
    : { className, onClick, ...rest };
  return React.createElement(target ? RRLink : 'a', props, children);
}

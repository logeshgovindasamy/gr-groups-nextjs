const Link = ({ href, children, className, ...props }) => {
  const React = require('react');
  return React.createElement('a', { href, className, ...props }, children);
};
module.exports = Link;
module.exports.default = Link;

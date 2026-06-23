const Image = ({ src, alt, ...props }) => {
  const React = require('react');
  return React.createElement('img', { src, alt, ...props });
};
module.exports = Image;
module.exports.default = Image;

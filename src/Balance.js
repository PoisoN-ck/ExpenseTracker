import React from 'react';
import PropTypes from 'prop-types';

function Balance(props) {
  const { balance } = props;

  return (
    <h1>
      {`${balance} HUF`}
    </h1>
  )
}

Balance.propTypes = {
  balance: PropTypes.number.isRequired,
};

export default Balance;

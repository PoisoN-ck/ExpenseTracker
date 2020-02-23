import React from 'react';
import PropTypes from 'prop-types';

function MoneyRecord(props) {
  const { valueRecord, categoryRecord } = props;

  return (
    <li>
      {valueRecord > 0 ? 'Income ' : 'Expense '}
      {`${valueRecord} HUF, ${categoryRecord}`}
    </li>
  )
}

MoneyRecord.propTypes = {
  valueRecord: PropTypes.number.isRequired,
  categoryRecord: PropTypes.string.isRequired,
}

export default MoneyRecord

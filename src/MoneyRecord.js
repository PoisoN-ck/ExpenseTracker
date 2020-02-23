import React from 'react';

function MoneyRecord(props) {
    const {record} = props;

    return(
        <li>
            {record > 0 ? 'Income' : 'Expense'} {record} HUF
        </li>
    )
}

export default MoneyRecord;
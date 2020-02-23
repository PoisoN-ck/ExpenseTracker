import React from 'react';

function MoneyRecord(props) {
    const {valueRecord, categoryRecord} = props;

    return(
        <li>
            {valueRecord > 0 ? 'Income' : 'Expense'} {valueRecord} HUF, {categoryRecord}
        </li>
    )
}

export default MoneyRecord;
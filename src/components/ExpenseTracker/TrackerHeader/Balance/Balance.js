import React, { useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { convertAmountToString } from '../../../../utils';
import ButtonIcon from '../../../common/ButtonIcon';
import BalanceCard from './BalanceCard';

const Balance = ({
    totalBalance,
    earnings,
    spendings,
    totalConstantExpensesToBePaid,
    freeCashAvailable,
    isDiffBalancesShown,
}) => {
    const [showBalance, setShowBalance] = useState(false);
    const [currentlyShownBalanceIndex, setCurrentlyShownBalanceIndex] =
        useState(0);

    const showHideNumbers = () => {
        setShowBalance((prevStatus) => !prevStatus);
    };

    const handlePrevClick = () =>
        setCurrentlyShownBalanceIndex((prevState) =>
            prevState - 1 < 0 ? allBalances.length - 1 : prevState - 1,
        );

    const handleNextClick = () =>
        setCurrentlyShownBalanceIndex((prevState) =>
            prevState + 1 > allBalances.length - 1 ? 0 : prevState + 1,
        );

    const allBalances = useMemo(
        () =>
            isDiffBalancesShown
                ? [
                      { title: 'Current balance', value: totalBalance },
                      {
                          title: 'Free cash available',
                          value: freeCashAvailable,
                      },
                      {
                          title: 'Constant expenses to be paid',
                          value: totalConstantExpensesToBePaid,
                      },
                  ]
                : [{ title: 'Current balance', value: totalBalance }],
        [
            totalConstantExpensesToBePaid,
            freeCashAvailable,
            totalBalance,
            isDiffBalancesShown,
        ],
    );

    const balancesCards = useMemo(
        () =>
            allBalances.map((balance, i) => (
                <div
                    key={balance.title}
                    className="balance__shown"
                    style={{
                        left: `${
                            (currentlyShownBalanceIndex + i * -1) * -100
                        }%`,
                    }}
                >
                    <BalanceCard
                        balance={balance}
                        showHideNumbers={showHideNumbers}
                        showBalance={showBalance}
                    />
                </div>
            )),
        [allBalances, showBalance, currentlyShownBalanceIndex],
    );

    const [currentBalanceData] = allBalances;

    return (
        <div className="balance padding-vertical-lg">
            <div className="container balance__content">
                <div className="balance__header">
                    <h1 className="balance__title text-sm text-uppercase margin-bottom-md">
                        Overview
                    </h1>
                </div>
                {isDiffBalancesShown ? (
                    <div className="flex-center flex-align-center gap-20 full-width">
                        <ButtonIcon
                            style="no-background"
                            icon="fa-solid fa-angle-left color--white"
                            handleClick={handlePrevClick}
                        />
                        <div className="flex-center flex-align-center balance__total-container padding-vertical-lg">
                            {balancesCards}
                        </div>
                        <ButtonIcon
                            style="no-background"
                            icon="fa-solid fa-angle-right color--white"
                            handleClick={handleNextClick}
                        />
                    </div>
                ) : (
                    <div className="balance__total-container">
                        <BalanceCard
                            balance={currentBalanceData}
                            showHideNumbers={showHideNumbers}
                            showBalance={showBalance}
                        />
                    </div>
                )}
                <div className="balance__breakdown">
                    <span className="balance__type">
                        <p className="text-xs text-uppercase text-bold text-muted">
                            Earnings
                        </p>
                        <p className="text-md">{`${
                            showBalance
                                ? convertAmountToString(earnings)
                                : '••• ••• •••'
                        }`}</p>
                    </span>
                    <span className="balance__vertical-line" />
                    <span className="balance__type">
                        <p className="text-xs text-uppercase text-bold text-muted">
                            Spendings
                        </p>
                        <p className="text-md">{`${
                            showBalance
                                ? convertAmountToString(spendings)
                                : '••• ••• •••'
                        }`}</p>
                    </span>
                </div>
            </div>
        </div>
    );
};

Balance.propTypes = {
    totalBalance: PropTypes.number.isRequired,
    earnings: PropTypes.number.isRequired,
    spendings: PropTypes.number.isRequired,
    totalConstantExpensesToBePaid: PropTypes.number.isRequired,
    freeCashAvailable: PropTypes.number.isRequired,
    isDiffBalancesShown: PropTypes.bool.isRequired,
};

export default Balance;

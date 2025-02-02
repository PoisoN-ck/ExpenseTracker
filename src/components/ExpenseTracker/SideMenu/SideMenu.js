import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { ConstantExpense, UserSetting } from '../../../types';
import ConstantExpenses from './ConstantExpenses';
import UserSettings from './UserSettings';

const SideMenu = ({
    isShown,
    setIsShown,
    usersSettings,
    constantExpenses,
    addUserSettings,
    chosenUser,
    setChosenUser,
    handleSignOut,
    addConstantExpense,
    editConstantExpense,
}) => {
    const [isUserSettingsShown, setIsUserSettingsShown] = useState(false);
    const [isExpensesShown, setIsExpensesShown] = useState(false);

    const handleClose = () => setIsShown(false);

    return (
        <div className={`menu ${isShown ? 'menu--shown' : ''}`}>
            <button
                className="upper-menu__sign-out upper-menu__button"
                type="button"
                onClick={handleSignOut}
            />
            <button
                className="icon close-button close-button-menu"
                type="button"
                onClick={handleClose}
            />
            <ul className="menu-list">
                <li className="menu-item">
                    <button
                        onClick={() =>
                            setIsUserSettingsShown((prevState) => !prevState)
                        }
                        className="button button--pure-white button-big-text"
                    >
                        User Settings
                    </button>
                    <UserSettings
                        chosenUser={chosenUser}
                        setChosenUser={setChosenUser}
                        usersSettings={usersSettings}
                        addUserSettings={addUserSettings}
                        isShown={isUserSettingsShown}
                    />
                </li>
                <li className="menu-item">
                    <button
                        onClick={() =>
                            setIsExpensesShown((prevState) => !prevState)
                        }
                        className="button button--pure-white button-big-text"
                    >
                        Constant expenses
                    </button>
                    <ConstantExpenses
                        constantExpenses={constantExpenses}
                        isShown={isExpensesShown}
                        addConstantExpense={addConstantExpense}
                        editConstantExpense={editConstantExpense}
                    />
                </li>
            </ul>
        </div>
    );
};

SideMenu.propTypes = {
    isShown: PropTypes.bool.isRequired,
    setIsShown: PropTypes.func.isRequired,
    usersSettings: PropTypes.array,
    addUserSettings: PropTypes.func.isRequired,
    chosenUser: UserSetting,
    setChosenUser: PropTypes.func.isRequired,
    handleSignOut: PropTypes.func.isRequired,
    constantExpenses: PropTypes.arrayOf(ConstantExpense),
    addConstantExpense: PropTypes.func.isRequired,
    editConstantExpense: PropTypes.func.isRequired,
    deleteConstantExpense: PropTypes.func,
};

export default SideMenu;

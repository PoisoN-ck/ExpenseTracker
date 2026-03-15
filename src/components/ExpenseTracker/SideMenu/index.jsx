import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import ConstantExpenses from './ConstantExpenses';
import UserSettings from './UserSettings';

const SideMenu = ({ isShown, setIsShown, handleSignOut }) => {
    const [isUserSettingsShown, setIsUserSettingsShown] = useState(false);
    const [isExpensesShown, setIsExpensesShown] = useState(false);

    const handleClose = () => setIsShown(false);

    useEffect(() => {
        const noScrollClass = 'no-scroll';

        isShown
            ? document.body.classList.add(noScrollClass)
            : document.body.classList.remove(noScrollClass);
    }, [isShown]);

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
                    <UserSettings isShown={isUserSettingsShown} />
                </li>
                <li className="menu-item">
                    <button
                        onClick={() =>
                            setIsExpensesShown((prevState) => !prevState)
                        }
                        className="button button--pure-white button-big-text"
                    >
                        Planned expenses
                    </button>
                    <ConstantExpenses isShown={isExpensesShown} />
                </li>
            </ul>
        </div>
    );
};

SideMenu.propTypes = {
    isShown: PropTypes.bool.isRequired,
    setIsShown: PropTypes.func.isRequired,
    handleSignOut: PropTypes.func.isRequired,
};

export default SideMenu;

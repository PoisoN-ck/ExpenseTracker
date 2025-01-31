import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MAIN_COLOR } from '../../../../constants';
import { UserSetting } from '../../../../types';
import Dropdown from '../../../common/Dropdown';

const UserSettings = ({
    usersSettings,
    addUserSettings,
    chosenUser,
    setChosenUser,
    isShown,
}) => {
    const [newUserName, setNewUserName] = useState('');
    const [newUserColor, setNewUserColor] = useState(MAIN_COLOR);

    const availableUsersOptions = usersSettings.map((userSettings) => (
        <option key={userSettings?.id} value={userSettings?.id}>
            {userSettings?.name}
        </option>
    ));

    const handleInputChange = (e) => setNewUserName(e.target.value);
    const handleColorChange = (e) => setNewUserColor(e.target.value);
    const handleUserSelect = (e) => {
        const [selectedUser] = usersSettings.filter(
            (userSettings) => userSettings?.id === e.target.value,
        );

        if (selectedUser) {
            localStorage.setItem('userSettings', JSON.stringify(selectedUser));

            setChosenUser(selectedUser);
        }
    };
    const handleAddNewUser = async () => {
        const userId = uuidv4();

        const newUser = {
            name: newUserName,
            color: newUserColor,
            id: userId,
        };

        await addUserSettings(newUser);

        setChosenUser(newUser);
        setNewUserName('');
        setNewUserColor(MAIN_COLOR);
    };

    return (
        <div
            className={`menu-section ${
                isShown && 'section-shown'
            } flex-column flex-align-center`}
        >
            <div className="menu-subsection">
                <label
                    className="menu-label user-settings__label"
                    htmlFor="userNames"
                >
                    Choose current user
                </label>
                {/* TODO: Move to a separate common component */}
                <div className="user-settings-container">
                    <div className="user-settings__user-input-container">
                        <Dropdown
                            style={`${chosenUser.color ? '' : 'full-width'}`}
                            isRounded
                            options={availableUsersOptions}
                            size="sm"
                            selectedValue={chosenUser?.id}
                            handleSelect={handleUserSelect}
                        />
                        {chosenUser.color && (
                            <input
                                className="user-settings__userName-color"
                                type="color"
                                disabled
                                value={chosenUser?.color}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="menu-subsection padding-vertical-md">
                <h3 className="text-md text-uppercase text-muted">or</h3>
            </div>
            <div className="menu-subsection">
                <label
                    className="menu-label user-settings__label"
                    htmlFor="newUserName"
                >
                    Add new user with color
                </label>
                {/* TODO: Move to a separate common component */}
                <div className="user-settings-container">
                    <div className="user-settings__user-input-container">
                        <input
                            className="input-field input-field--sm width-90"
                            name="newUserName"
                            id="newUserName"
                            value={newUserName}
                            placeholder="User name"
                            onChange={handleInputChange}
                        />
                        <input
                            className="user-settings__userName-color"
                            type="color"
                            value={newUserColor}
                            onChange={handleColorChange}
                        />
                    </div>
                    <button
                        className="button button--blue button--round"
                        type="button"
                        onClick={handleAddNewUser}
                    >
                        Add new user
                    </button>
                </div>
            </div>
            <div className="menu-subsection">
                <h3 className="text-sm text-muted">
                    *To be able to differentiate your transactions by color
                </h3>
            </div>
        </div>
    );
};

UserSettings.propTypes = {
    usersSettings: PropTypes.array,
    addUserSettings: PropTypes.func.isRequired,
    chosenUser: UserSetting,
    setChosenUser: PropTypes.func.isRequired,
    isShown: PropTypes.bool.isRequired,
};

export default UserSettings;

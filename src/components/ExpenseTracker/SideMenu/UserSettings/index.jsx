import PropTypes from 'prop-types';
import { useState } from 'react';
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

        const isUserSettingsAdded = await addUserSettings(newUser);

        if (isUserSettingsAdded) {
            setChosenUser(newUser);
            setNewUserName('');
            setNewUserColor(MAIN_COLOR);
        }
    };

    return (
        <div
            className={`menu-section ${
                isShown && 'section-shown'
            } flex-column flex-align-center text-center`}
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
                            style={`${
                                chosenUser.color ? '' : 'full-width'
                            } user-settings-input`}
                            isRounded
                            options={availableUsersOptions}
                            size="sm"
                            selectedValue={chosenUser?.id}
                            handleSelect={handleUserSelect}
                            placedholder="Select user"
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
                <h3 className="text-md text-uppercase text-muted padding-vertical-md">
                    or
                </h3>
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
                            className="input-field input-field--sm user-settings-input"
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
                <h3 className="text-sm text-muted text-center">
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

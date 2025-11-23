import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import TextInput from '@components/common/TextInput';
import { DAYS_LIST_IN_A_MONTH, DEFAULT_REFRESH_DAY } from '@/constants';
import useUserSettings from '@/hooks/useUserSettings';

const DAYS = 31;
const WEEK_LENGTH = 7;

export const DayPicker = () => {
    const { plannedExpenseDayRefresh, updatePlannedExpenseDayRefresh } =
        useUserSettings();
    const [plannedExpenseDay, setPlannedExpenseDay] =
        useState(DEFAULT_REFRESH_DAY);
    const [focused, setFocused] = useState(plannedExpenseDay ?? 1);
    const [isShown, setIsShown] = useState(false);

    const containerRef = useRef(null);
    const refs = useRef([]);

    useEffect(() => {
        setPlannedExpenseDay(plannedExpenseDayRefresh);
    }, [plannedExpenseDayRefresh]);

    useEffect(() => {
        if (!plannedExpenseDay) setFocused(plannedExpenseDay);
    }, [plannedExpenseDay]);

    useEffect(() => {
        // Focus the focused cell when it changes
        const el = refs.current[Number(focused) - 1];
        if (el && typeof el.focus === 'function') el.focus();
    }, [focused]);

    // Close when clicking outside the picker
    useEffect(() => {
        const handleOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsShown(false);
            }
        };

        if (isShown) {
            document.addEventListener('pointerdown', handleOutside);
        }
        return () => document.removeEventListener('pointerdown', handleOutside);
    }, [isShown]);

    const handleDaySelect = async (day) => {
        setIsShown(false);
        setPlannedExpenseDay(day);
        await updatePlannedExpenseDayRefresh(day);
    };

    const handleKeyDown = (e, idx) => {
        let next = idx;
        switch (e.key) {
            case 'ArrowLeft':
                next = (idx - 1 + DAYS) % DAYS;
                break;
            case 'ArrowRight':
                next = (idx + 1) % DAYS;
                break;
            case 'ArrowUp':
                next = (idx - WEEK_LENGTH + DAYS) % DAYS;
                break;
            case 'ArrowDown':
                next = (idx + WEEK_LENGTH) % DAYS;
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = DAYS - 1;
                break;
            case 'Enter':
            case ' ': // Space
                e.preventDefault();
                handleDaySelect(idx + 1);
                return;
            default:
                return;
        }
        e.preventDefault();
        setFocused(next + 1);
    };

    const handleInputClick = useCallback(() => {
        setIsShown(true);
        setFocused(plannedExpenseDay);
    }, [plannedExpenseDay]);

    return (
        <div className="flex-column">
            <TextInput
                style="no-margin margin-bottom-sm"
                labelStyle="margin-bottom-sm text-muted"
                size="sm"
                label="Select a day of planned expense refresh"
                value={plannedExpenseDay}
                onClick={handleInputClick}
            />
            <div
                ref={containerRef}
                className={`daypicker ${isShown ? '' : 'hidden'}`}
            >
                <div
                    className="daypicker-grid"
                    role="grid"
                    aria-label="Day of month selector"
                >
                    {DAYS_LIST_IN_A_MONTH.map((day) => {
                        const isSelected = Number(plannedExpenseDay) === day;
                        return (
                            <button
                                key={day}
                                ref={(el) => {
                                    refs.current[day - 1] = el;
                                }}
                                type="button"
                                role="gridcell"
                                aria-pressed={isSelected}
                                aria-label={`Day ${day}`}
                                className={`daypicker-cell ${isSelected ? 'selected' : ''} ${focused === day ? 'focused' : ''}`}
                                onClick={() => handleDaySelect(day)}
                                onKeyDown={(e) => handleKeyDown(e, day - 1)}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DayPicker;

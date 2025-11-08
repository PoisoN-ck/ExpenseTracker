import PropTypes from 'prop-types';

const Modal = ({
    contentClassName,
    children,
    closeModal: handleCloseModal,
    title,
}) => {
    return (
        <div className="modal">
            <div className="modal__container">
                <h3 className="modal__title text-align-center text-md text-uppercase padding-vertical-sm">
                    {title}
                </h3>
                <button
                    className="icon close-button"
                    type="button"
                    onClick={handleCloseModal}
                />
                <div className={`modal__content ${contentClassName}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    contentClassName: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
    closeModal: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
};

export default Modal;

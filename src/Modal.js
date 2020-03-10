import React from 'react';
import PropTypes from 'prop-types';

function Modal(props) {
  const {
    children,
    closeModal,
    modalName,
    title,
  } = props

  function handleCloseModal() {
    closeModal(modalName);
  }

  return (
    <div className="modal">
      <div className="modal__container">
        <h3 className="modal__title text-align-center text-md text-uppercase padding-vertical-sm">{title}</h3>
        <button className="icon close-button" type="button" onClick={handleCloseModal}> </button>
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element, PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  closeModal: PropTypes.func.isRequired,
  modalName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default Modal

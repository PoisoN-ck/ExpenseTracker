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
      <div className="container modal__content">
        <h3 className="modal__title text-align-center text-md text-uppercase text-bold padding-vertical-sm">{title}</h3>
        <button className="icon close-button" type="button" onClick={handleCloseModal}> </button>
        <div className="modal__items-list">
          {children}
        </div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  closeModal: PropTypes.func.isRequired,
  modalName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default Modal

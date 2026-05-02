import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { closeModal } from "./modalSlice";

export default function Modal({ children }) {
  const dispatch = useDispatch();

  return createPortal(
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className='modal__close-btn cursor_pointer' onClick={() => dispatch(closeModal())}>
          Close
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
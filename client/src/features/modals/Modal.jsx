import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { closeModal } from "./modalSlice";

export default function Modal({ children }) {
  const dispatch = useDispatch();

  return createPortal(
    <div className="overlay" onClick={() => dispatch(closeModal())}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => dispatch(closeModal())}>
          Close
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
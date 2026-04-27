import React from 'react'
import { useSelector } from 'react-redux'
import VideoPlayerModal from './VideoPlayerModel'
import RegisterUserModal from '../users/RegisterUserModal';
import AssignCamerasModal from './AssignCamerasModal';

const ModalManager = () => {
    const { type, props } = useSelector((state) => state.modal);

    if (!type) return null;

    let content;

    switch (type) {
        case "videoPlayer":
            content = <VideoPlayerModal {...props} />;
            break;
        case "registerUser":
            content = <RegisterUserModal {...props} />;
            break;
        case "assignCameras":
            content = <AssignCamerasModal {...props} />;
            break
        case "registerCamera":
            content = <RegisterCameraModal {...props} />;
            break
        default:
            return null;
    }

  return <Modal>{content}</Modal>;
}

export default ModalManager
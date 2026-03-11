import cv2
import os.path
import numpy as np
import logging
from PIL import Image, ImageDraw
from setup import getConfigSettings

class CompareImages:
        def __init__(self, thresholdPercent, videoDimensions, maskDebug=False):
                currPath = os.getcwd()
                self.config = getConfigSettings()
                
                self.logger = logging.getLogger(self.config['LOG_INFO']['logger_name'])

                self.width = videoDimensions[0]
                self.height = videoDimensions[1]
                # if need smaller (smaller === less sensativity due to reducing image noise like light. e.g. 32x32)
                #self.resizeW = 32
                #self.resizeH = 32
                self.reductionFactor = 4    # 1 for original
                # resizeW * resizeH and grayscale each element is 0-255. Therefore resizeW * resizeH * 255 = totalPixels.
                # threshold pixel changes = totalPixels * thresholdPercent / 100
                self.threshold = 400 / self.reductionFactor
                
                self.arrImages = [[None, None], [None, None]     # [original grayscaled for rectangle determination, for motion detection]
                self.frameNumber = 0
                self.maskDebug = maskDebug
                self.maskFrames = []
                self.currPath = currPath
                self.diff = 0
                
        def saveMaskImagesToGIF(suffix):
                if (maskDebug == False or len(self.maskFrames) == 0):
                        retrun
                pil_images = [Image.fromarray(frame) for frame in frames]
                
                if pil_images:
                        pil_images[0].save(
                                f'maskFrames_{suffix}.gif',
                                save_all=True,
                                append_images=pil_images[1:],
                                duration=100,  # Duration per frame in milliseconds
                                loop=0         # Loop forever (0 means infinite loop)
                        )
                        print("GIF saved successfully using Pillow")
                        
                self.maskFrames = []
                
        def increaseFrameNumber(self):
                self.frameNumber += 1
                
        def resetFrameNumber(self):
                self.frameNumber = 0
                
        def setThreshold(self, threshold):
                self.threshold = threshold
                #self.threshold = (self.width * self.originalSizeRatio * self.height * self.originalSizeRatio * 256) * thresholdPercent / 100
                
        def getThreshold(self):
                return self.threshold
                
        def setCurrentImage(self, image):
                self.arrImages[0] = self.arrImages[1].copy()
                width, height, _ = image.shape
                self.arrImages[1] = [image, cv2.resize(image, (int(width / self.reductionFactor), int(height / self.reductionFactor)), None, None, None, interpolation=cv2.INTER_AREA)]
                
        def get_mask(frame1, frame2, kernel=np.array((9,9), dtype=np.uint8)):
                """ Obtains image mask
                Inputs: 
                    frame1 - frame at time t
                    frame2 - frame at time t + 1
                    kernel - (NxN) array for Morphological Operations
                Outputs: 
                    mask - Thresholded mask for moving pixels
                """
                frame1 = cv2.cvtColor(frame1, cv2.COLOR_RGB2GRAY)
                frame2 = cv2.cvtColor(frame2, cv2.COLOR_RGB2GRAY)
                frame_diff = cv2.subtract(frame2, frame1)

                # blur the frame difference to reduce noise
                frame_diff = cv2.medianBlur(frame_diff, 3)
                
                # purpose: improves the contrast in an image for low light, must do after blur or else the noise will be equalized to appear more.
                #frame_diff = cv2.equalizeHist(frame_diff) # camera quality not great, brings a lot of noise even with high blur
            
                # param 5: blockSize: A smaller blockSize reacts more sensitively to local variations, A larger blockSize results in a more globally consistent threshold.
                mask = cv2.adaptiveThreshold(frame_diff, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 3)
                #ret, mask = cv2.threshold(frame_diff,5,255,cv2.THRESH_BINARY)
                # ** Conclusion 1: Use adaptiveThrehold since it will be beneficial for environments with changning lighting like outdoors. 
                #       Static threshold with low threshold value produced similar disjointed object detection with some introduction of additional noise due to the low threshold.
                # ** Conclusion 2: I think it is the camera quality that is producing enough noise on some edges so that it is not registered as a difference in the mask difference. 
                #       The frame_diff subtraction shows where visually there are changes, but some of the pixels produce 0 or very low difference when the frames are compared.
                #       Enough of these low values clustered disjoints the object's contours. 
                # ** Conclusion 3: If try to reduce threshold to convert these low values to 255 for mask, it will also catch some noise. Trying to equlalizeHist introduces a lot of noise, even after bluring before. 
                #       Increasing kernal for closing did not produce significant improvement compared to base 9x9, just the current lines thickened.
                # ** Conclusion 4: After testing blur, equalizeHist, thresholding for mask, blur again, morp close for noise again, morph open with higher kernels to try to connect object, 
                #       this current configuration is the best it can be.
                # ** Conclusion 5: I forgot can do the mask on a reduced image size. This will reduce noise and since downsmapling, 
                #       the changing pixels will get closer together and will cause the threshold + morph CLOSE to produce a mask of objects closer together. 
                #       Then when boxes with the contours are being determined, there is higher overlap that causes the boxes to be joined to make larger detection boxes.
                #       This helped a little.
                
                mask = cv2.medianBlur(mask, 3)
                
                # morphological operations
                # Open to remove small speckles (noise)
                mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
                # Close to fill small holes inside objects
                # pick 9x9 to limit computation time since increasing the kernal RECT provides minuscule improvement in closing the huge gaps in the frame difference.
                # cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
                mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)

                return mask
                
        def get_contour_detections(mask, thresh=400):
                """ Obtains initial proposed detections from contours discoverd on the mask. 
                Scores are taken as the bbox area, larger is higher.
                Inputs:
                    mask - thresholded image mask
                    thresh - threshold for contour size
                Outputs:
                    detectons - array of proposed detection bounding boxes and scores [[x1,y1,x2,y2,s]]
                        """
                # get mask contours
                contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_TC89_L1)
                detections = []
                for cnt in contours:
                        x,y,w,h = cv2.boundingRect(cnt)
                        area = w*h
                        if area > thresh: 
                                detections.append([x,y,x+w,y+h, area])

                return np.array(detections)
                
        def remove_contained_bboxes(boxes):
            """ Removes all smaller boxes that are contained within larger boxes.
                Requires bboxes to be soirted by area (score)
                Inputs:
                    boxes - array bounding boxes sorted (descending) by area 
                            [[x1,y1,x2,y2]]
                Outputs:
                    keep - indexes of bounding boxes that are not entirely contained 
                           in another box
                """
            check_array = np.array([True, True, False, False])
            keep = list(range(0, len(boxes)))
            for i in keep: # range(0, len(bboxes)):
                for j in range(0, len(boxes)):
                    # check if box j is completely contained in box i
                    if np.all((np.array(boxes[j]) >= np.array(boxes[i])) == check_array):
                                        # bx1 >= ax1 == true, by1 >= ay1 == true, bx2 >= ax2 == false, by2 >= ay2 == false 
                        try:
                            keep.remove(j)
                        except ValueError:
                            continue
            return keep
    
        def non_max_suppression(boxes, scores, threshold=1e-1):
            """
            Perform non-max suppression on a set of bounding boxes and corresponding scores.
            Inputs:
                boxes: a list of bounding boxes in the format [xmin, ymin, xmax, ymax]
                scores: a list of corresponding scores 
                threshold: the IoU (intersection-over-union) threshold for merging bounding boxes
            Outputs:
                boxes - non-max suppressed boxes
            """
            # Sort the boxes by score in descending order
            boxes = boxes[np.argsort(scores)[::-1]] if len(boxes) > 0 else np.array([])

            # remove all contained bounding boxes and get ordered index
            order = remove_contained_bboxes(boxes)

            keep = []
            while order:
                i = order.pop(0)
                keep.append(i)
                for j in order:
                    # Calculate the IoU between the two boxes
                    # min(ax2, bx2) - max(ax1, bx1) * min(ay1, by1) - max(ay2, by2)
                    intersection = max(0, min(boxes[i][2], boxes[j][2]) - max(boxes[i][0], boxes[j][0])) * \
                                   max(0, min(boxes[i][3], boxes[j][3]) - max(boxes[i][1], boxes[j][1]))
                    union = (boxes[i][2] - boxes[i][0]) * (boxes[i][3] - boxes[i][1]) + \
                            (boxes[j][2] - boxes[j][0]) * (boxes[j][3] - boxes[j][1]) - intersection
                    iou = intersection / union

                    # Remove boxes with IoU greater than the threshold
                    if iou > threshold:
                        order.remove(j)
                        
            return boxes[keep]
            
        def get_detections(frame1, frame2, bbox_thresh=400, nms_thresh=1e-3, mask_kernel=np.array((9,9), dtype=np.uint8), frameNumber=0, mask_frames=[]):
                """ Main function to get detections via Frame Differencing
                Inputs:
                    frame1 - Grayscale frame at time t
                    frame2 - Grayscale frame at time t + 1
                    bbox_thresh - Minimum threshold area for declaring a bounding box 
                    nms_thresh - IOU threshold for computing Non-Maximal Supression
                    mask_kernel - kernel for morphological operations on motion mask
                Outputs:
                    detections - list with bounding box locations of all detections
                        bounding boxes are in the form of: (xmin, ymin, xmax, ymax)
                        """

                # get image mask for moving pixels
                mask = get_mask(frame1, frame2, mask_kernel)
                if (self.maskDebug):
                        self.maskFrames.append(mask)
                #cv2.imwrite(imgPath + f'mask_{frameNumber}.jpg', mask)

                # get initially proposed detections from contours
                detections = get_contour_detections(mask, bbox_thresh)
                
                # separate bboxes and scores
                bboxes = detections[:, :4] if len(detections) > 0 else np.array([])
                scores = detections[:, -1] if len(detections) > 0 else np.array([])

                # perform Non-Maximal Supression on initial detections to remove fully contained detections and join detections that surpass IOU
                return non_max_suppression(bboxes, scores, nms_thresh)
                    
        def draw_bboxes(frame, detections, reductionFactor):
                for det in detections:
                        x1,y1,x2,y2 = det
                        cv2.rectangle(frame, (x1 * reductionFactor,y1 * reductionFactor), (x2 * reductionFactor,y2 * reductionFactor), (0,255,0), 2)
                        
        def saveImage(self, img, suffix):
                savePath = self.currPath + f'/{self.config["FOLDERS"]["image_output_folder"]}/diffImg_{suffix}_{self.frameNumber}.png'
                
                if os.path.exists(savePath):
                    self.logger.error(f'ERR: saveDiffImage: Cannot save diff image, file name exists - {savePath}')
                    return
                    
                # Save or display the image
                success = cv2.imwrite(savePath, img)

                if success:
                    print("Diff Image saved successfully!")
                else:
                    print("Failed to save diff image.")
                        
        def saveDiffImage(self, detections, suffix):
                
                # draw detections
                img = self.arrImages[0][1].copy()
                draw_bboxes(img, detections, 1)

                saveImage(img, suffix)
                
        def funcCompareImages(self, saveDiffImage=False, suffix=''):
                
                if (self.arrImages[0][1] === None or self.arrImages[0][1] != self.arrImages[1][1]):
                    self.logger.info(f"CompareImages: Waiting for 2 valid images to compare.")
                    # nothing to compare
                    return False, None
                
                # Very helpful
                # https://medium.com/@itberrios6/introduction-to-motion-detection-part-1-e031b0bb9bb2
                # have 2 frames, apply frame diff
                # read frames
                frame1_bgr = self.arrImages[0][1].copy()
                frame2_bgr = self.arrImages[1][1].copy()

                # get detections
                detections = get_detections(frame1_bgr, frame2_bgr, bbox_thresh=self.threshold, nms_thresh=1e-4, mask_kernel=np.array((9,9), dtype=np.uint8))
                                                                
                frame2_og = frames[1][0].copy()
                # draw bounding boxes on frame
                draw_bboxes(frame2_og, detections, self.reductionFactor)
                
                if (self.maskDebug == True):
                    self.logger.info(f"CompareImages: Threshold: {self.getThreshold()}, Detections: {detections}")
                    print(f"CompareImages: Threshold: {self.getThreshold()}, Detections: {detections}")
                
                if (saveDiffImage == True):
                    self.saveDiffImage(detections, suffix)
                    
                return True if len(detections) > 0 else False, frame
                
        def startThread(self, save=False, suffix=''):
                thread = threading.Thread(target=self.funcCompareImages, args=(save, suffix))
                thread.start()
                return thread

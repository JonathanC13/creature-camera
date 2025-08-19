import cv2
import os.path
import numpy as np
from PIL import Image

class CompareImages:
    def __init__(self, currPath, logger, resizeW, resizeH, thresholdPercent):
        self.logger = logger
        # resizeW * resizeH and grayscale each element is 0-255. Therefore resizeW * resizeH * 255 = totalPixels.
        # threshold pixel changes = totalPixels * thresholdPercent / 100
        self.threshold = 0
        self.setThreshold(resizeW, resizeH, thresholdPercent)
        #print(self.threshold)
        self.arrImages = [np.ndarray(shape=(0,0)), np.ndarray(shape=(0,0))]
        self.currPath = currPath
        self.diff = 0
        
    def saveImages(self, suffix):
        self.saveDiffImage(self.arrImages[0], suffix + "_1")
        self.saveDiffImage(self.arrImages[1], suffix + "_2")
        return
        
    def setThreshold(self, resizeW, resizeH, thresholdPercent):
        self.threshold = (resizeW * resizeH * 255) * thresholdPercent / 100
        
    def getThreshold(self):
        return self.threshold
        
    def setCurrentImage(self, image):
        self.arrImages[0] = np.copy(self.arrImages[1])
        
        self.arrImages[1] = self.convertImageToMatrix(image)
            
    def convertImageToMatrix(self, image):
        matrix = []
        if (np.size(image) == 0):
            return matrix
        
        try:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)	# convert to grayscale
            image = cv2.resize(image, (32, 32), None, None, None, interpolation=cv2.INTER_CUBIC)	# reduce size and smooth a bit using PIL
            matrix = image.astype(np.int64)   # convert from unsigned bytes to signed int using numpy
            
        except Exception as e:
            print(e)
        finally:
            return matrix
        
    def saveDiffImage(self, matrix, suffix):
        savePath = self.currPath + f'/output/diffImg_{suffix}.png'
        
        if os.path.exists(savePath):
            #print(f'CompareImages: Cannot save diff image, file name exists - {savePath}')
            self.logger.error(f'CompareImages: Cannot save diff image, file name exists - {savePath}')
            return
        
        pixelData = []
        rows, cols = matrix.shape

        for r in range(rows):
            for c in range(cols):
                pixelData.append(matrix[r][c])

        imgBytes = bytes(pixelData)

        img = Image.frombytes("L", (cols, rows), imgBytes)

        # Save or display the image
        try:
            img.save(savePath)
            #print(f'CompareImages: Image saved at {savePath}')
            self.logger.info(f'CompareImages: Image saved at {savePath}')
        except Exception as e:
            #print(f'CompareImages: saveDiffImage() failed. {e}')
            self.logger.error(f'CompareImages: saveDiffImage() failed. {e}')
        
    def funcCompareImages(self, save=False, suffix='', debug=False):
        
        if (np.size(self.arrImages[0]) == 0 or np.size(self.arrImages[1]) == 0):
            return False, 0
        
        diffMatrix = np.abs(self.arrImages[0] - self.arrImages[1])
        diffValue = diffMatrix.sum()
        self.diff = diffValue
        # + str(diffValue > self.getThreshold()
        if (debug == True):
            #print(f"CompareImages: diff value at {suffix}: {diffValue}, past threshold: " + str(diffValue > self.getThreshold()))
            self.logger(f"CompareImages: diff value at {suffix}: {diffValue}, past threshold: " + str(diffValue > self.getThreshold()))
        
        if (save == True):
            self.saveDiffImage(diffMatrix, suffix)
        
        return True if diffValue > self.getThreshold() else False, diffValue
        
    def startThread(self, save=False, suffix=''):
        thread = threading.Thread(target=self.funcCompareImages, args=(save, suffix))
        thread.start()
        return thread
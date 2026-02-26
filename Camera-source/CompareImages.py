import cv2
import os.path
import numpy as np
import logging
from PIL import Image, ImageDraw
from setup import getConfigSettings

class CompareImages:
    def __init__(self, thresholdPercent):
        currPath = os.getcwd()
        self.config = getConfigSettings()
        
        self.logger = logging.getLogger(self.config['LOG_INFO']['logger_name'])
        
        self.resizeW = 32
        self.resizeH = 32
        # resizeW * resizeH and grayscale each element is 0-255. Therefore resizeW * resizeH * 255 = totalPixels.
        # threshold pixel changes = totalPixels * thresholdPercent / 100
        self.threshold = 0
        self.setThreshold(thresholdPercent)
        #print(self.threshold)
        self.arrImages = [[np.ndarray(shape=(0,0)), np.ndarray(shape=(0,0))], [np.ndarray(shape=(0,0)), np.ndarray(shape=(0,0))]]     # [i][0] = for motion detection, [i][0] = original grayscaled for rectangle determination
        self.currPath = currPath
        self.diff = 0
        
    def saveImages(self, suffix):
        self.saveDiffImage(self.arrImages[0][1], suffix + "_1")
        self.saveDiffImage(self.arrImages[1][1], suffix + "_2")
        return
        
    def setThreshold(self, thresholdPercent):
        self.threshold = (self.resizeW * self.resizeH * 255) * thresholdPercent / 100
        
    def getThreshold(self):
        return self.threshold
        
    def setCurrentImage(self, image):
        self.arrImages[0] = [np.copy(self.arrImages[1][0]), np.copy(self.arrImages[1][1])]
        self.arrImages[1] = [self.convertImageToMatrix(image, True), self.convertImageToMatrix(image)]
            
    def convertImageToMatrix(self, image, resize=False):
        matrix = []
        if (np.size(image) == 0):
            return matrix
        
        try:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)	# convert to grayscale
            if (resize == True):
                image = cv2.resize(image, (self.resizeW, self.resizeH), None, None, None, interpolation=cv2.INTER_CUBIC)	# reduce size and smooth a bit using PIL
            matrix = image.astype(np.int64)   # convert from unsigned bytes to signed int using numpy
            
        except Exception as e:
            print(e)
        finally:
            return matrix
        
    def saveDiffImage(self, matrix, rectanglePoints, suffix):
        savePath = self.currPath + f'/{self.config["FOLDERS"]["image_output_folder"]}/diffImg_{suffix}.png'
        
        if os.path.exists(savePath):
            #print(f'CompareImages: Cannot save diff image, file name exists - {savePath}')
            self.logger.error(f'ERR: CompareImages: Cannot save diff image, file name exists - {savePath}')
            return
        
        img = self.createDiffImageFromMatrix(matrix)
        
        # draw rectangle
        draw = ImageDraw.Draw(img)
        draw.rectangle(rectanglePoints, None, 'white',1)        # since "L" gray scale, the colour cannot be other than a grayscale value.

        # Save or display the image
        try:
            img.save(savePath, 'PNG')
            #print(f'CompareImages: Image saved at {savePath}')
            self.logger.info(f'CompareImages: Image saved at {savePath}')
        except Exception as e:
            #print(f'CompareImages: saveDiffImage() failed. {e}')
            self.logger.error(f'ERR: CompareImages: saveDiffImage() failed. {e}')
            
    def createDiffImageFromMatrix(self, matrix):
        pixelData = []
        rows, cols = matrix.shape

        for r in range(rows):
            for c in range(cols):
                pixelData.append(matrix[r][c])

        imgBytes = bytes(pixelData)

        img = Image.frombytes("L", (cols, rows), imgBytes)
        
        return img
        
    def funcCompareImages(self, save=False, suffix='', debug=False):
        
        if (np.size(self.arrImages[0]) == 0 or np.size(self.arrImages[1]) == 0):
            # nothing to compare
            return False, [(0,0), (0,0)], 0
        
        diffMatrix = np.abs(self.arrImages[0][0] - self.arrImages[1][0])
        diffValue = diffMatrix.sum()
        self.diff = diffValue
        # + str(diffValue > self.getThreshold()
        if (debug == True):
            #print(f"CompareImages: diff value at {suffix}: {diffValue}, past threshold: " + str(diffValue > self.getThreshold()))
            self.logger.info(f"CompareImages: diff value at {suffix}: {diffValue}, past threshold: " + str(diffValue > self.getThreshold()))
        
        rectanglePoints = [(0,0),(0,0)]
        if diffValue > self.getThreshold():
            # find the rectangle points with the original images
            fullSizeDiffMatrix = np.abs(self.arrImages[0][0] - self.arrImages[1][0])
            
            img = self.createDiffImageFromMatrix(fullSizeDiffMatrix)
            
            rectanglePoints =  self.findDiffRectangle(img)
            
            if (save == True):
                self.logger.info(f"CompareImages: diffVlaue {diffValue}, threshold: {self.getThreshold()}")
                self.saveDiffImage(fullSizeDiffMatrix, rectanglePoints, suffix)
            
        ret = (True if diffValue > self.getThreshold() else False, rectanglePoints, diffValue)
            
        return ret
        
    def findDiffRectangle(self, diffImage):
        rectanglePoints = [(0,0),(0,0)]
        if (diffImage is None):
            return rectanglePoints
            
        pixels = diffImage.load()
        width, height = diffImage.size  
        diffSensitivity = 10
        
        topLeft = [height-1, width-1]
        botRight = [0,0]
            
        # get top left
        for y in range(0,height,1):
            for x in range(0,width,1):
                if (pixels[x, y] >= diffSensitivity):
                    topLeft = [min(topLeft[0], x), min(topLeft[1], y)]
                    botRight = [max(botRight[0], x), max(botRight[1], y)]
        
        # ensure topLeft <= botRight
        topLeft = [min(topLeft[0], botRight[0]), min(topLeft[1], botRight[1])]
        rectanglePoints = [topLeft, botRight]   
        
        return rectanglePoints
        
    def startThread(self, save=False, suffix=''):
        thread = threading.Thread(target=self.funcCompareImages, args=(save, suffix))
        thread.start()
        return thread

from PIL import Image
import numpy as np
import io

IMG_SIZE = (299, 299)

def preprocess_image(img_bytes):
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    image = image.resize(IMG_SIZE)
    array = np.array(image).astype('float32') / 255.0  # matches ImageDataGenerator(rescale)
    return np.expand_dims(array, axis=0)

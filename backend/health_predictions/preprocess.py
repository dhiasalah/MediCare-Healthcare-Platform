from PIL import Image
import io


# Configuration for brain tumor segmentation preprocessing
BRAIN_TUMOR_CONFIG = {
    "image_size": 256,
}


def preprocess_image(image_bytes):
    """
    Preprocess image for brain tumor segmentation model.
    
    Args:
        image_bytes: Image bytes
        
    Returns:
        PIL Image object
    """
    # Load image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    
    # Resize to standard size
    image = image.resize((BRAIN_TUMOR_CONFIG["image_size"], BRAIN_TUMOR_CONFIG["image_size"]))
    
    return image


def preprocess_image_for_segmentation(image_bytes):
    """Alias for preprocess_image for brain tumor segmentation."""
    return preprocess_image(image_bytes)


"""
Utility functions for processing medical images for brain tumor segmentation
Simplified version using only PIL and NumPy - Compatible with UNETR model
"""
import numpy as np
from io import BytesIO
from PIL import Image
import base64


def simple_patchify(image, patch_size):
    """
    Simple patchify without external library
    Extracts patches from image
    """
    h, w = image.shape[:2]
    patches = []
    
    for i in range(0, h, patch_size):
        for j in range(0, w, patch_size):
            patch = image[i:i+patch_size, j:j+patch_size]
            if patch.shape[0] == patch_size and patch.shape[1] == patch_size:
                patches.append(patch)
    
    return np.array(patches)


def process_image_for_model(image_file, config):
    """
    Process an uploaded image file for the UNETR model.
    
    Args:
        image_file: Django UploadedFile object
        config: Configuration dictionary with model parameters
        
    Returns:
        tuple: (processed_image, original_image_array) as numpy arrays
    """
    try:
        # Read image from uploaded file
        image_data = image_file.read()
        image = Image.open(BytesIO(image_data)).convert('RGB')
        
        # Resize to model's expected size (256x256)
        image = image.resize((config["image_size"], config["image_size"]), Image.Resampling.LANCZOS)
        image_array = np.array(image, dtype=np.float32)
        
        # Normalize to 0-1 range
        image_normalized = image_array / 255.0
        
        # Extract patches - UNETR expects flattened patches
        patch_size = config["patch_size"]  # 16
        patches = simple_patchify(image_normalized, patch_size)
        
        # Reshape patches for UNETR model input
        # Expected: (num_patches, patch_size * patch_size * channels) = (256, 768)
        num_patches = patches.shape[0]
        flat_patches = patches.reshape(num_patches, -1).astype(np.float32)
        
        # Add batch dimension: (1, 256, 768)
        batch_patches = np.expand_dims(flat_patches, axis=0)
        
        return batch_patches, image_array
        
    except Exception as e:
        raise ValueError(f"Error processing image: {str(e)}")


def postprocess_segmentation(prediction, config):
    """
    Convert model prediction to segmentation mask image.
    
    Args:
        prediction: Model output (probability map) - shape should be (h, w, 1) or (h, w)
        config: Configuration dictionary
        
    Returns:
        Segmentation mask as numpy array (0-255 uint8)
    """
    try:
        # Handle different prediction shapes
        if len(prediction.shape) == 4:
            prediction = prediction[0]  # Remove batch dimension
        
        if len(prediction.shape) == 3 and prediction.shape[-1] == 1:
            prediction = prediction[:, :, 0]  # Remove channel dimension
        
        # Ensure correct size (256x256)
        if prediction.shape != (config["image_size"], config["image_size"]):
            # Use PIL to resize if needed
            pred_image = Image.fromarray((prediction * 255).astype(np.uint8))
            pred_image = pred_image.resize(
                (config["image_size"], config["image_size"]), 
                Image.Resampling.LANCZOS
            )
            prediction = np.array(pred_image, dtype=np.float32) / 255.0
        
        # Normalize prediction to 0-1 range if not already
        pred_min = np.min(prediction)
        pred_max = np.max(prediction)
        if pred_max > pred_min:
            prediction = (prediction - pred_min) / (pred_max - pred_min)
        
        # Apply a more sensitive threshold to capture smaller tumors
        # Use adaptive threshold based on the distribution
        threshold = np.percentile(prediction, 50)  # Use median as threshold
        if threshold == 0:
            threshold = 0.5  # Fallback to 50% if all zeros
        
        # Convert to 0-255 range
        segmentation_mask = (np.clip(prediction, 0, 1) * 255).astype(np.uint8)
        
        # Apply threshold for binary mask (more sensitive)
        binary_mask = np.where(prediction > threshold, 255, 0).astype(np.uint8)
        
        return binary_mask
        
    except Exception as e:
        raise ValueError(f"Error postprocessing segmentation: {str(e)}")


def create_comparison_image(original_image, mask, config):
    """
    Create a side-by-side comparison image for visualization.
    
    Args:
        original_image: Original resized image (float32 0-1 or uint8 0-255)
        mask: Segmentation mask (uint8 0-255)
        config: Configuration dictionary
        
    Returns:
        Concatenated comparison image (uint8 RGB)
    """
    try:
        # Ensure original is uint8
        if original_image.dtype != np.uint8:
            original_image = (np.clip(original_image, 0, 1) * 255).astype(np.uint8)
        
        # Ensure original is 3-channel RGB
        if len(original_image.shape) == 2:
            original_image = np.stack([original_image] * 3, axis=2)
        
        # Create white separator line
        separator = np.ones((config["image_size"], 10, 3), dtype=np.uint8) * 255
        
        # Convert mask to 3-channel RGB
        if len(mask.shape) == 2:
            mask_3channel = np.stack([mask, mask, mask], axis=2)
        else:
            mask_3channel = mask
        
        # Concatenate: original | separator | mask
        comparison = np.concatenate([original_image, separator, mask_3channel], axis=1)
        
        return comparison
        
    except Exception as e:
        raise ValueError(f"Error creating comparison image: {str(e)}")


def image_to_base64(image_array):
    """
    Convert numpy array image to base64 string for API response.
    
    Args:
        image_array: Numpy array representing image (uint8 or float32)
        
    Returns:
        Image as base64 encoded string
    """
    try:
        # Ensure uint8
        if image_array.dtype != np.uint8:
            if np.max(image_array) <= 1.0:
                image_array = (np.clip(image_array, 0, 1) * 255).astype(np.uint8)
            else:
                image_array = np.clip(image_array, 0, 255).astype(np.uint8)
        
        # Convert to PIL Image
        if len(image_array.shape) == 2:  # Grayscale
            pil_image = Image.fromarray(image_array, mode='L')
        else:  # RGB
            pil_image = Image.fromarray(image_array, mode='RGB')
        
        # Save to bytes buffer
        buffer = BytesIO()
        pil_image.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Encode to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return image_base64
        
    except Exception as e:
        raise ValueError(f"Error converting image to base64: {str(e)}")


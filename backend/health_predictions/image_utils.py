"""
Utility functions for processing medical images for brain tumor segmentation
Simplified version using only PIL and NumPy - Compatible with UNETR model
"""
import numpy as np
from io import BytesIO
from PIL import Image
import base64


def simple_patchify(image, patch_size, num_channels=3):
    """
    Patchify implementation that mimics the patchify library behavior.
    Extracts non-overlapping patches from image and returns them in the correct order.
    
    Args:
        image: Input image of shape (H, W, C) normalized to 0-1
        patch_size: Size of each patch (e.g., 16)
        num_channels: Number of channels (default 3 for RGB)
        
    Returns:
        patches: Array of shape (num_patches, patch_size * patch_size * num_channels)
    """
    h, w, c = image.shape
    num_patches_h = h // patch_size
    num_patches_w = w // patch_size
    num_patches = num_patches_h * num_patches_w
    
    # Extract patches in row-major order (same as patchify library)
    patches = []
    for i in range(num_patches_h):
        for j in range(num_patches_w):
            patch = image[i*patch_size:(i+1)*patch_size, j*patch_size:(j+1)*patch_size, :]
            # Flatten the patch to (patch_size * patch_size * num_channels)
            flat_patch = patch.reshape(-1)
            patches.append(flat_patch)
    
    return np.array(patches, dtype=np.float32)


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
        
        # Keep original as uint8 for display
        original_image_array = np.array(image, dtype=np.uint8)
        
        # Normalize to 0-1 range for model input
        image_normalized = original_image_array.astype(np.float32) / 255.0
        
        # Extract patches using the corrected patchify function
        # This mimics: patches = patchify(image, (16, 16, 3), 16)
        # Then: patches = np.reshape(patches, (256, 768))
        patch_size = config["patch_size"]  # 16
        num_channels = config["num_channels"]  # 3
        
        # Get flattened patches: shape (256, 768) for 256x256 image with 16x16 patches
        flat_patches = simple_patchify(image_normalized, patch_size, num_channels)
        
        # Add batch dimension: (1, 256, 768)
        batch_patches = np.expand_dims(flat_patches, axis=0)
        
        return batch_patches, original_image_array
        
    except Exception as e:
        raise ValueError(f"Error processing image: {str(e)}")


def postprocess_segmentation(prediction, config):
    """
    Convert model prediction to segmentation mask image.
    
    Args:
        prediction: Model output (probability map) - shape should be (1, h, w, 1) or similar
        config: Configuration dictionary
        
    Returns:
        Segmentation mask as numpy array (0-255 uint8)
    """
    try:
        # Handle different prediction shapes
        # Model output is typically (batch, height, width, channels) = (1, 256, 256, 1)
        if len(prediction.shape) == 4:
            prediction = prediction[0]  # Remove batch dimension -> (256, 256, 1)
        
        if len(prediction.shape) == 3 and prediction.shape[-1] == 1:
            prediction = prediction[:, :, 0]  # Remove channel dimension -> (256, 256)
        
        # Ensure the prediction is in the correct shape
        if prediction.shape != (config["image_size"], config["image_size"]):
            # Resize if needed using PIL
            pred_normalized = np.clip(prediction, 0, 1)
            pred_image = Image.fromarray((pred_normalized * 255).astype(np.uint8))
            pred_image = pred_image.resize(
                (config["image_size"], config["image_size"]), 
                Image.Resampling.LANCZOS
            )
            prediction = np.array(pred_image, dtype=np.float32) / 255.0
        
        # The model outputs values between 0 and 1 (sigmoid activation)
        # Simply scale to 0-255 range for visualization
        # Values close to 1 indicate tumor regions
        prediction = np.clip(prediction, 0, 1)
        
        # Convert to 0-255 range for display
        segmentation_mask = (prediction * 255).astype(np.uint8)
        
        return segmentation_mask
        
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


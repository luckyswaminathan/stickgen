import requests
import json
import base64
from typing import Dict, Any, Optional

async def generate_styled_image(prompt: str, style: str) -> Dict[str, Any]:
    """
    Generate an image using SDXL with style-specific prompts.
    
    Args:
        prompt: Base prompt describing the image
        style: Style identifier ('anime', 'cartoon', 'realistic')
        
    Returns:
        Dictionary containing generated image and metadata
    """
    # Style-specific prompt modifiers
    style_prompts = {
        'anime': "anime style, Studio Ghibli, cel shaded, vibrant colors",
        'cartoon': "cartoon style, Disney/Pixar, clean lines, bold colors",
        'realistic': "photorealistic, detailed, high resolution, professional photography",
    }
    
    # Get style prompt or default to realistic
    style_modifier = style_prompts.get(style, style_prompts['realistic'])
    
    # Combine base prompt with style
    full_prompt = f"{prompt}, {style_modifier}, high quality, detailed"
    
    # Negative prompts to improve quality
    negative_prompt = "blurry, low quality, distorted, bad anatomy, watermark, signature, text"
    
    try:
        # Call SageMaker endpoint
        API_URL = "https://runtime.sagemaker.us-east-1:891612544795:endpoint/jumpstart-dft-stabilityai-sdxl-1-0-20241207-064752"
        
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "negative_prompt": negative_prompt,
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "width": 1024,
                "height": 1024
            }
        }
        
        response = requests.post(
            API_URL,
            json=payload,
            headers={
                "Content-Type": "application/json"
            }
        )
        response.raise_for_status()
        
        # Process response
        image_bytes = response.content
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        return {
            "status": "success",
            "image": base64_image,
            "metadata": {
                "prompt": full_prompt,
                "negative_prompt": negative_prompt,
                "style": style,
                "original_prompt": prompt
            }
        }
        
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "metadata": {
                "prompt": full_prompt,
                "style": style
            }
        }

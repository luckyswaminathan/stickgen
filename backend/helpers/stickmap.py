from dataclasses import dataclass
import numpy as np
import io
import base64

# Try importing PIL first
try:
    from PIL import Image
except ImportError:
    print("Warning: PIL not properly installed")
    Image = None

# Try importing OpenCV
try:
    import cv2
except ImportError:
    print("Warning: OpenCV not properly installed")
    cv2 = None

@dataclass
class ProcessedImage:
    data: str  # Changed from bytes to str to handle base64
    content_type: str
    success: bool
    error: str = None

async def process_stick_figure_upload(file: UploadFile) -> ProcessedImage:
    try:
        # Read the file content
        image_data = await file.read()
        
        # If neither library is available, return original data
        if cv2 is None and Image is None:
            print("Warning: No image processing libraries available")
            # Convert bytes to base64 string
            base64_data = base64.b64encode(image_data).decode('utf-8')
            return ProcessedImage(
                data=base64_data,
                content_type=file.content_type,
                success=False,
                error="No image processing libraries available"
            )
            
        try:
            # Try PIL first if available
            if Image is not None:
                image = Image.open(io.BytesIO(image_data))
                # Process with PIL
                # Add your PIL-based processing here
                
                # Convert back to base64 string
                buffered = io.BytesIO()
                image.save(buffered, format=image.format or 'PNG')
                img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
                return ProcessedImage(
                    data=img_str,
                    content_type=f'image/{image.format.lower()}' if image.format else 'image/png',
                    success=True
                )
                
            # Fall back to OpenCV if PIL fails
            if cv2 is not None:
                nparr = np.frombuffer(image_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # Your OpenCV processing here
                
                # Convert back to base64 string
                _, buffer = cv2.imencode('.png', img)
                img_str = base64.b64encode(buffer).decode('utf-8')
                return ProcessedImage(
                    data=img_str,
                    content_type='image/png',
                    success=True
                )
                
        except Exception as e:
            print(f"Error processing image: {e}")
            # Convert original data to base64 string
            base64_data = base64.b64encode(image_data).decode('utf-8')
            return ProcessedImage(
                data=base64_data,
                content_type=file.content_type,
                success=False,
                error=str(e)
            )
            
    finally:
        # Reset file position for potential future reads
        await file.seek(0) 
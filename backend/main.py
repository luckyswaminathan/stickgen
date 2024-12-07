import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Request, Form, Body
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
from datetime import datetime, timezone
import uuid
import base64
from config import get_settings
from fastapi.responses import JSONResponse
from botocore.exceptions import ClientError
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
import json
from helpers.sdxlinfer import generate_styled_image
from pydantic import BaseModel

app = FastAPI()
# logging.getLogger("uvicorn.access").handlers = []
# uvicorn_logger = logging.getLogger("uvicorn.access")
# handler = logging.StreamHandler()
# handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
# uvicorn_logger.addHandler(handler)

class IgnorePingLogsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/ping":
            return await call_next(request)
        response = await call_next(request)
        return response
class IgnorePingFilter(logging.Filter):
    def filter(self, record):
        return "GET /ping" not in record.getMessage()

# Apply the filter to uvicorn access logger
logging.getLogger("uvicorn.access").addFilter(IgnorePingFilter())
    
app.add_middleware(IgnorePingLogsMiddleware)
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = get_settings()

print(f"AWS Region: {settings.AWS_ACCESS_KEY_ID}")
print(f"S3 Bucket: {settings.AWS_SECRET_ACCESS_KEY}")

# Initialize AWS clients
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

# Initialize DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)
table = dynamodb.Table('stickgen_animations')
@app.get("/")
async def root():
    return {"message": "Welcome to StickGen API"}

@app.get("/ping")
async def ping(id: str = Query(None), port: int = Query(None)):
    return {
        "status": "ok",
        "id": id,
        "port": port
    }

@app.post("/upload/{user_id}")
async def upload_file(file: UploadFile = File(...), prompt: Optional[str] = Body(None), user_id: str = None, style_id: str = None):
    print(f"Uploading file:")
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "video/mp4"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="File type not allowed. Please upload an image or video file."
            )

        # Read file content
        content = await file.read()

        # Generate filenames - use the same filename for both S3 and DynamoDB
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{os.urandom(16).hex()}{file_extension}"  # This will be used for both S3 and DynamoDB
        creation_id = str(datetime.now(timezone.utc).isoformat())

        try:
            # Upload to S3
            s3_key = f"animations/{user_id}/{unique_filename}"
            s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key,
                Body=content,
                ContentType=file.content_type,
                Metadata={
                    'original_filename': file.filename,
                    'upload_date': str(datetime.now(timezone.utc).isoformat())
                }
            )

            # Store metadata in DynamoDB
            metadata = {
                "prompt": prompt,
                "user_id": user_id,
                "style": style_id,
                "creation_id": creation_id,
                "filename": unique_filename,  # Using the same filename for both
                "original_filename": file.filename  # Store the original filename if needed
            }

            table.put_item(Item=metadata)

            return {
                "status": "success",
                "s3_key": s3_key,
                "filename": unique_filename
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error uploading to S3: {str(e)}"
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the file: {str(e)}"
        )

@app.get("/gallery/{user_id}")
async def get_gallery(user_id: str = None):
    try:
        print(f"Getting gallery for user_id: {user_id}")
        if user_id:
            response = table.query(
                KeyConditionExpression='user_id = :uid',
                ExpressionAttributeValues={
                    ':uid': user_id
                }
            )
        else:
            response = {}
        
        animations = response.get('Items', [])
        print(f"Found {len(animations)} animations")

        gallery_items = []
        for animation in animations:
            try:
                # Use the filename directly from DynamoDB
                s3_key = f"animations/{animation['user_id']}/{animation['filename']}"
                print(f"Fetching S3 object with key: {s3_key}")
                
                s3_response = s3_client.get_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=s3_key
                )
                
                # Read the image data and convert to base64
                image_data = s3_response['Body'].read()
                base64_image = base64.b64encode(image_data).decode('utf-8')
                
                gallery_item = {
                    "animation_id": animation.get('creation_id'),
                    "user_id": animation['user_id'],
                    "filename": animation['filename'],
                    "original_filename": animation.get('original_filename'),
                    "created_at": animation.get('creation_id'),
                    "content_type": s3_response['ContentType'],
                    "image_data": base64_image,
                    "s3_url": s3_key,
                    "prompt": animation.get('prompt'),
                    "style": animation.get('style')
                }
                gallery_items.append(gallery_item)
                
            except ClientError as e:
                print(f"Error fetching image from S3: {str(e)} for key {s3_key}")
                gallery_item = {
                    "animation_id": animation.get('creation_id'),
                    "user_id": animation['user_id'],
                    "filename": animation['filename'],
                    "original_filename": animation.get('original_filename'),
                    "created_at": animation.get('creation_id'),
                    "content_type": None,
                    "image_data": None,
                    "s3_url": s3_key,
                    "prompt": animation.get('prompt'),
                    "style": animation.get('style'),
                    "error": f"Failed to fetch image: {str(e)}"
                }
                gallery_items.append(gallery_item)

        return JSONResponse(content={
            "status": "success",
            "animations": gallery_items
        })

    except Exception as e:
        print(f"Gallery error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving animations: {str(e)}"
        )

class GenerateRequest(BaseModel):
    prompt: str

@app.post("/generate/{user_id}")
async def generate_image(
    user_id: str,
    style: str = Query(..., enum=["anime", "cartoon", "realistic"]),
    body: GenerateRequest = Body(...)
):
    print(f"\n=== Generation Request ===")
    print(f"User ID: {user_id}")
    print(f"Style: {style}")
    print(f"Prompt: {body.prompt}")
    
    try:
        # Generate image
        result = await generate_styled_image(body.prompt, style)
        
        if result["status"] != "success":
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate image: {result.get('error')}"
            )
            
        # Generate filename
        timestamp = datetime.now(timezone.utc).isoformat()
        filename = f"{uuid.uuid4()}.png"
        print(f"\nGenerated Filename: {filename}")
        
        try:
            print("\nProcessing image data...")
            image_data = base64.b64decode(result["image"])
            
            print("\nUploading to S3...")
            s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=f"generations/{user_id}/{filename}",
                Body=image_data,
                ContentType="image/png",
                Metadata={
                    "prompt": body.prompt,
                    "style": style,
                    "created_at": timestamp
                }
            )
            print("S3 upload successful")
            
            response_data = {
                "status": "success",
                "url": f"generations/{user_id}/{filename}",
                "metadata": result["metadata"]
            }
            print("\nResponse Data:", response_data)
            return response_data
            
        except Exception as e:
            error_msg = f"Error saving to S3: {str(e)}"
            print(f"\nError: {error_msg}")
            print(f"Exception details: {type(e).__name__}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=error_msg
            )
            
    except HTTPException as he:
        print(f"\nHTTP Exception: {str(he)}")
        raise he
    except Exception as e:
        error_msg = f"Error in image generation: {str(e)}"
        print(f"\nUnexpected error: {error_msg}")
        print(f"Exception details: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )
    


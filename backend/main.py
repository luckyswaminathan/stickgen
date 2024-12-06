from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
from datetime import datetime, timezone
import uuid
from config import get_settings

app = FastAPI()

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

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user_id: str = None):
    print(f"Uploading file:")
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "video/mp4"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="File type not allowed. Please upload an image or video file."
            )

        # Generate unique IDs
        animation_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1].lower()
        safe_filename = f"{animation_id}{file_extension}"
        creation_id = str(datetime.now(timezone.utc).isoformat())

        # Read file content
        content = await file.read()

        try:
            # Upload to S3
            s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=f"animations/{user_id}/{safe_filename}",
                Body=content,
                ContentType=file.content_type,
                Metadata={
                    'original_filename': file.filename,
                    'upload_date': str(datetime.now(timezone.utc).isoformat())
                }
            )

            print(f"Uploaded to S3: {safe_filename}")

            # Generate the S3 URL
            s3_url = f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/animations/{user_id}/{safe_filename}"

            # Store metadata in DynamoDB
            animation_data = {
                'animation_id': animation_id,
                'creation_id': creation_id,
                'user_id': user_id or 'anonymous',
                'filename': file.filename,
                'safe_filename': safe_filename,
                'content_type': file.content_type,
                's3_url': s3_url,
                'created_at': str(datetime.now(timezone.utc).isoformat())
            }
            print(f"Storing in DynamoDB: {animation_data}")
            table.put_item(Item=animation_data)

            return {
                "status": "success",
                "animation_id": animation_id,
                "filename": safe_filename,
                "original_name": file.filename,
                "content_type": file.content_type,
                "s3_url": s3_url
            }

        except boto3.exceptions.Boto3Error as e:
            print(e)
            raise HTTPException(
                status_code=500,
                detail=f"Error with AWS services: {str(e)}"
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the file: {str(e)}"
        )

@app.get("/gallery")
async def get_gallery(user_id: str = None):
    try:
        if user_id:
            response = table.query(
                KeyConditionExpression='user_id = :uid',
                ExpressionAttributeValues={
                    ':uid': user_id
                }
            )
        else:
            # Get all animations
            response = table.scan()

        return {
            "status": "success",
            "animations": response.get('Items', [])
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving animations: {str(e)}"
        )
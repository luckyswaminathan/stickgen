import React, { useState, useCallback, useRef, DragEvent } from 'react';
import { Upload, Image as ImageIcon, Loader } from 'lucide-react';

export default function ImageUploadApp() {
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [generateStatus, setGenerateStatus] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);
  
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadStatus('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    uploadFile(file);
  };
  
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('');
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setUploadStatus('Upload successful');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const generateImage = async () => {
    if (!prompt) {
      setGenerateStatus('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    setGenerateStatus('');
    
    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      
      if (data.success) {
        setGenerateStatus('Generation successful');
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setGenerateStatus(`Error: ${error instanceof Error ? error.message : 'Generation failed'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-8 text-gray-900">Image Generator</h1>
        
        {/* Upload Section */}
        <div className="mb-8 pb-8 border-b border-gray-100">
          <h2 className="text-sm font-semibold mb-4 text-gray-700">Upload Reference Image</h2>
          
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#ff6b6b] hover:bg-gray-50 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            
            {!preview ? (
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="w-8 h-8 mb-2" />
                <span>Drag and drop an image here or click to upload</span>
              </div>
            ) : (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
            )}
          </div>
          
          {isUploading && (
            <div className="flex items-center mt-4 text-gray-600">
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </div>
          )}
          
          {uploadStatus && (
            <div className={`mt-4 text-sm ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {uploadStatus}
            </div>
          )}
        </div>
        
        {/* Generate Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold mb-4 text-gray-700">Generate New Image</h2>
          
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate"
            className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b6b] focus:border-transparent"
          />
          
          <button
            onClick={generateImage}
            disabled={isGenerating}
            className="bg-[#ff6b6b] text-white px-6 py-2 rounded-lg hover:bg-[#ff5252] transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </div>
            ) : (
              'Generate'
            )}
          </button>
          
          {generateStatus && (
            <div className={`mt-4 text-sm ${generateStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {generateStatus}
            </div>
          )}
        </div>
        
        {/* Result Section */}
        {generatedImage && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-4 text-gray-700">Generated Image</h2>
            <img src={generatedImage} alt="Generated" className="w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
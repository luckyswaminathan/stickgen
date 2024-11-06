import React, { useState, useCallback, useRef, DragEvent } from 'react';
import { Upload, Image as ImageIcon, Loader, ChevronDown } from 'lucide-react';

export default function ImageUploadApp() {
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [generateStatus, setGenerateStatus] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cartoonThemes = [
    { id: 'pixar', name: 'Pixar Style', description: 'Vibrant 3D animation style like Toy Story' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
    { id: 'disney', name: 'Disney Classic', description: 'Traditional Disney animation style' },
    { id: 'southpark', name: 'South Park', description: 'Simple, quirky paper cut-out style' },
    { id: 'simpsons', name: 'The Simpsons', description: 'Yellow-skinned cartoon style' },
    { id: 'pokemon', name: 'Pokémon', description: 'Bright anime style with bold outlines' },
    { id: 'ghibli', name: 'Studio Ghibli', description: 'Soft, detailed anime style' },
  ];
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
    if (!selectedTheme) {
      setGenerateStatus('Please select a theme');
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
    <div className="min-h-screen bg-[#F6F6EF]">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        {/* YC-style Header - Now Centered */}
        <header className="text-center mb-12">
          <h1 className="text-[32px] font-bold text-[#FF6600]">StickGen</h1>
          <p className="text-[#666666] mt-2 text-lg">
            Turn any stick figure into a cartoon
          </p>
        </header>

        {/* Main Content - Properly Centered */}
        <div className="space-y-8 w-full">
          {/* Upload Section */}
          <section className="bg-white p-8 rounded shadow-sm">
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-6 text-center">
              1. Upload Your Image
            </h2>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#EAEAEA] rounded-lg 
                       bg-[#FAFAFA] p-12 text-center cursor-pointer 
                       hover:border-[#FF6600] hover:bg-white transition-colors 
                       duration-200 mx-auto max-w-2xl"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              
              {!preview ? (
                <div className="flex flex-col items-center justify-center text-[#666666]">
                  <Upload className="w-12 h-12 mb-4 text-[#FF6600]" />
                  <span className="text-base">Drag and drop your image here, or click to browse</span>
                </div>
              ) : (
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              )}
            </div>
            
            {isUploading && (
              <div className="flex items-center justify-center mt-4 text-[#666666]">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing your image...
              </div>
            )}
            
            {uploadStatus && (
              <div className={`mt-4 text-center ${
                uploadStatus.includes('Error') ? 'text-[#FF3B30]' : 'text-[#28CD41]'
              }`}>
                {uploadStatus}
              </div>
            )}
          </section>
          
          {/* Generate Section */}
          <section className="bg-white p-8 rounded shadow-sm">
            <h2 className="text-xl font-bold text-[#2D2D2D] mb-6 text-center">
              2. Customize Theme
            </h2>
            
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-6 py-4 text-left text-[#2D2D2D] bg-[#FAFAFA] 
                            border border-[#EAEAEA] rounded-lg hover:border-[#FF6600]
                            focus:outline-none focus:border-[#FF6600] transition-colors
                            flex items-center justify-between"
                >
                  <span className={selectedTheme ? 'text-[#2D2D2D]' : 'text-[#999999]'}>
                    {selectedTheme ? 
                      cartoonThemes.find(theme => theme.id === selectedTheme)?.name : 
                      'Select a cartoon style'}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#666666] transition-transform duration-200 
                            ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                  />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-[#EAEAEA] 
                                rounded-lg shadow-lg overflow-hidden">
                    {cartoonThemes.map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => {
                          setSelectedTheme(theme.id);
                          setIsDropdownOpen(false);
                        }}
                        className="flex flex-col p-4 cursor-pointer hover:bg-[#FAFAFA] 
                                border-b border-[#EAEAEA] last:border-b-0"
                      >
                        <span className="font-medium text-[#2D2D2D]">{theme.name}</span>
                        <span className="text-sm text-[#666666] mt-1">{theme.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={generateImage}
                  disabled={isGenerating || !selectedTheme}
                  className="w-full sm:w-auto px-8 py-4 bg-[#FF6600] text-white 
                          font-medium rounded-lg hover:bg-[#FF7F33] 
                          transition-colors duration-200 disabled:opacity-50
                          disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    'Generate Sticker'
                  )}
                </button>
              </div>
            </div>
            
            {generateStatus && (
              <div className={`mt-4 text-center ${
                generateStatus.includes('Error') ? 'text-[#FF3B30]' : 'text-[#28CD41]'
              }`}>
                {generateStatus}
              </div>
            )}
          </section>
          
          {/* Result Section */}
          {generatedImage && (
            <section className="bg-white p-8 rounded shadow-sm">
              <h2 className="text-xl font-bold text-[#2D2D2D] mb-6 text-center">
                3. Your Generated Sticker
              </h2>
              <div className="max-w-2xl mx-auto">
                <img 
                  src={generatedImage} 
                  alt="Generated Sticker" 
                  className="w-full rounded-lg shadow-sm" 
                />
                <div className="flex justify-center mt-6">
                  <button
                    className="px-8 py-3 border border-[#EAEAEA] rounded-lg 
                             text-[#666666] hover:border-[#FF6600] 
                             hover:text-[#FF6600] transition-colors duration-200"
                  >
                    Download Sticker
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[#EAEAEA] text-center text-[#666666]">
          <p>© 2024 StickGen · <a href="#" className="hover:text-[#FF6600]">About</a> · <a href="#" className="hover:text-[#FF6600]">Contact</a></p>
        </footer>
      </div>
    </div>

  );
}
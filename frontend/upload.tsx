import React, { useState } from 'react';

const MyComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    if (!file) {
      console.log('No file selected');
      setError('Please select a file before uploading');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      const data = await response.json();
      console.log('Upload successful:', data);
    } catch (error) {
      console.error('Upload failed:', error);
      if (error instanceof Error) {
        setError(`Upload failed: ${error.message}`);
      } else {
        setError('Upload failed: An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default MyComponent;


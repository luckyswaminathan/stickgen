import React from 'react'

interface PlaceholderImageProps {
  width: number
  height: number
  text?: string
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ width, height, text = 'Placeholder Image' }) => {
  return (
    <div 
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
    >
      {text}
    </div>
  )
}


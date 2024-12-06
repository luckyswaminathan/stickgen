import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = new formidable.IncomingForm()
  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' })
    }

    const file = files.file as formidable.File
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
      // Here you would typically process the file, save it to a database, etc.
      // For this example, we'll just log the file details
      console.log('File received:', file.originalFilename)
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      res.status(200).json({ message: 'File uploaded successfully' })
    } catch (error) {
      console.error('Error processing file:', error)
      res.status(500).json({ error: 'Error processing file' })
    }
  })
}


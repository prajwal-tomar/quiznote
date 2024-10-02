import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    let extractedText = '';

    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdf(Buffer.from(fileBuffer));
      extractedText = pdfData.text;
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(fileBuffer) });
      extractedText = result.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    console.log(extractedText)

    return NextResponse.json({ extractedText });
  } catch (error) {
    console.error('Error in text extraction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add a GET handler for testing
export async function GET() {
  return NextResponse.json({ message: "Extract text API is working" })
}

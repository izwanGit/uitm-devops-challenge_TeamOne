import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pdfPath = path.join('/');

    // Fetch the PDF from the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const pdfUrl = `${backendUrl}/uploads/${pdfPath}`;

    try {
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: 'PDF not found' },
                { status: 404 }
            );
        }

        const pdfBuffer = await response.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('Error proxying PDF:', error);
        return NextResponse.json(
            { error: 'Failed to fetch PDF' },
            { status: 500 }
        );
    }
}

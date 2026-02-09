import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== TEST API START ===');
  console.log('Test endpoint reached successfully!');

  return NextResponse.json({
    message: 'Test API working',
    timestamp: new Date().toISOString()
  });
}
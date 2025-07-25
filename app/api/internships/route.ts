import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';

export async function POST(request: Request) {
  try {
    
    await dbConnect();
    
    // Parse request body
    const data = await request.json();
    

    const { userData, ...internshipData } = data;
    
    
    const internship = new Internship({
      ...internshipData,
      postedBy: userData.username,
      organizationName: userData.organizationName,
      organizationId: userData.organizationId,
    });
    
  
    await internship.save();
    
    return NextResponse.json({
      message: 'Internship posted successfully',
      internship
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating internship posting:', error);
    return NextResponse.json(
      { error: 'Failed to create internship posting', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const hideExpired = searchParams.get('hideExpired') === 'true';

    let query: any = {};
    if (organizationId) {
      query = { organizationId };
    }

    // Add filter for expired internships if requested
    if (hideExpired) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      query.applicationDeadline = { $gte: today };
    }

    const internships = await Internship.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({ internships });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch internships', details: error.message },
      { status: 500 }
    );
  }
}

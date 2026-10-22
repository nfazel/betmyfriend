import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { isProfileComplete, validateProfile } from '@/lib/profile';

export async function GET() {
  try {
    const userId = getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({ where: { userId } });
    return NextResponse.json({
      profile: profile
        ? {
            displayName: profile.displayName,
            age: profile.age,
            location: profile.location,
            interests: profile.interests,
          }
        : null,
      complete: isProfileComplete(profile),
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Ignore any client-supplied userId — writes always bind to the session user.
    const validation = validateProfile({
      displayName: body.displayName,
      age: body.age,
      location: body.location,
      interests: body.interests,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { displayName, age, location, interests } = validation.data;
    const profile = await db.profile.upsert({
      where: { userId },
      update: { displayName, age, location, interests },
      create: { userId, displayName, age, location, interests },
    });

    return NextResponse.json({
      profile: {
        displayName: profile.displayName,
        age: profile.age,
        location: profile.location,
        interests: profile.interests,
      },
      complete: isProfileComplete(profile),
      message: 'Profile saved successfully',
    });
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

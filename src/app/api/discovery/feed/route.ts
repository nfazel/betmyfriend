import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userProfile = await db.profile.findUnique({
      where: { userId },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Please create your profile first.' },
        { status: 404 }
      );
    }

    const pageValue = request.nextUrl.searchParams.get('page') ?? '1';
    const page = Number(pageValue);

    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
      return NextResponse.json(
        { error: 'Invalid page number.' },
        { status: 400 }
      );
    }

    const pageSize = 10;

    const existingSwipes = await db.swipe.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
    });

    const excludedUserIds = [
      userId,
      ...existingSwipes.map((swipe) => swipe.receiverId),
    ];

    const where = {
      userId: { notIn: excludedUserIds },
      displayName: { not: '' },
      location: { not: '' },
      age: { gte: 18 },
      interests: { isEmpty: false },
    };

    const profiles = await db.profile.findMany({
      where,
      select: {
        userId: true,
        displayName: true,
        age: true,
        location: true,
        interests: true,
        bio: true,
      },
      orderBy: { userId: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await db.profile.count({ where });

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error('Discovery feed error:', error);

    return NextResponse.json(
      { error: 'Unable to load discovery feed.' },
      { status: 500 }
    );
  }
}
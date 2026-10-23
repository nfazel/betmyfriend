import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const senderId = getSessionUserId();

    if (!senderId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const { receiverId, liked } = body as Record<string, unknown>;

    if (
      typeof receiverId !== 'string' ||
      receiverId.trim() === '' ||
      typeof liked !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Invalid receiverId or liked value' },
        { status: 400 }
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: 'Cannot connect with yourself' },
        { status: 400 }
      );
    }

    const senderProfile = await db.profile.findUnique({
      where: { userId: senderId },
      select: { id: true },
    });

    if (!senderProfile) {
      return NextResponse.json(
        { error: 'Please create your profile first' },
        { status: 403 }
      );
    }

    const receiverProfile = await db.profile.findUnique({
      where: { userId: receiverId },
      select: {
        displayName: true,
        location: true,
        age: true,
        interests: true,
      },
    });

    if (
      !receiverProfile ||
      !receiverProfile.displayName.trim() ||
      !receiverProfile.location.trim() ||
      receiverProfile.age < 18 ||
      receiverProfile.interests.length === 0
    ) {
      return NextResponse.json(
        { error: 'Profile unavailable' },
        { status: 404 }
      );
    }

    try {
      const swipe = await db.swipe.create({
        data: {
          senderId,
          receiverId,
          liked,
        },
        select: {
          id: true,
          receiverId: true,
          liked: true,
        },
      });

      return NextResponse.json({
        success: true,
        swipe,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return NextResponse.json(
          { error: 'You have already acted on this profile' },
          { status: 409 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Discovery action error:', error);

    return NextResponse.json(
      { error: 'Unable to record your decision' },
      { status: 500 }
    );
  }
}
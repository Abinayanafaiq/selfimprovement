import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Habit from '@/models/Habit';
import User from '@/models/User';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    // Get habits owned by user AND habits shared with user
    const habits = await Habit.find({
      $or: [
        { userId: user.userId },
        { sharedWith: user.userId }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({ habits });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, partnerUsername } = await req.json();
    await dbConnect();

    let sharedWith = [];
    if (partnerUsername) {
        const partner = await User.findOne({ username: partnerUsername });
        if (partner) {
            sharedWith.push(partner._id);
        }
    }

    const newHabit = await Habit.create({
      title,
      description,
      userId: user.userId,
      sharedWith
    });

    return NextResponse.json({ habit: newHabit }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

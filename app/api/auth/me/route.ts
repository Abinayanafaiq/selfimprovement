import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    console.log('Me API Token:', token ? 'Found' : 'Missing');

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = await verifyJWT(token);
    console.log('Me API Payload:', payload);

    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId).select('-password');

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ 
        user: { 
            id: user._id, 
            username: user.username, 
            wins: user.wins,
            dailyPlan: user.dailyPlan 
        } 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 }); // Fail silently for 'me' check
  }
}

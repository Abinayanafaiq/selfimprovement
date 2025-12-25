import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const currentUser = token ? await verifyJWT(token) : null;

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    let filter: any = {};
    if (query) {
      filter = { username: { $regex: query, $options: 'i' } };
    }

    const users = await User.find(filter)
      .select('username wins')
      .limit(20);

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

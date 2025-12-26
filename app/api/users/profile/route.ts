import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyJWT(token);

        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { avatarEmoji, avatarColor } = body;

        const user = await User.findById(decoded.userId);
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        if (avatarEmoji) user.avatarEmoji = avatarEmoji;
        if (avatarColor) user.avatarColor = avatarColor;

        await user.save();

        return NextResponse.json({ message: 'Profile updated', user });
    } catch (err) {
        return NextResponse.json({ message: 'Error', error: err }, { status: 500 });
    }
}

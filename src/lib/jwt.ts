import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = `${process.env.JWT_EXPIRES_IN || '30m'}`;

type JwtUserPayload = { userId: string; role: string; name: string };

export function generateToken(user: JwtUserPayload) {
    return jwt.sign(
        { userId: user.userId, role: user.role, name: user.name }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
}

export function verifyToken(token: string): JwtUserPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    } catch {
        return null;
    }
}


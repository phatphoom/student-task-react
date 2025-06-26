import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import axios from 'axios';
import { GoogleUserResponse } from '@/types/google-signin';

// export const authOptions: NextAuthOptions = {
const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user?._id) token._id = user._id;
            if (user?.isAdmin) token.isAdmin = user.isAdmin;
            return token;
        },
        // async session({ session, token, user }: any) {
        // 	// user id is stored in ._id when using credentials provider
        // 	if (token?._id) session.user._id = token._id;

        // 	// user id is stored in ._id when using google provider
        // 	if (token?.sub) session.user._id = token.sub;

        // 	if (token?.isAdmin) session.user.isAdmin = token.isAdmin;
        // 	return session;
        // },
        async session({ session, token }) {
            if (session?.user?.email) {
                try {
                    const res = await axios.post<GoogleUserResponse>(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/users/check-email`,
                        { email: session.user.email },
                    );

                    if (res.data.exists) {
                        const {
                            id,
                            hintword,
                            username,
                            email,
                            user_type,
                            created_by,
                            created_on,
                        } = res.data.user;

                        session.user = {
                            ...session.user,
                            id: id,
                            hintword: hintword,
                            username: username,
                            email: email,
                            userType: user_type,
                            createdBy: created_by,
                            createdOn: created_on,
                        };
                    }
                } catch (err) {
                    console.error('Error enriching session from DB:', err);
                }
            }

            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

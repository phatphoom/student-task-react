import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        // user: {
        //     name?: string;
        //     email?: string;
        //     image?: string;
        //     _id?: string;
        //     isAdmin?: boolean;
        // };
        user: {
            name?: string;
            email?: string;
            image?: string;
            _id?: string; // google_id
            id: string;
            hintword?: string;
            username: string;
            email?: string
            userType: string;
            createdBy: string;
            createdOn: string
        };
    }

    interface JWT {
        _id?: string;
        isAdmin?: boolean;
        sub?: string;
    }
}

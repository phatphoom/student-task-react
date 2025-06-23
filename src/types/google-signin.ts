export type GoogleUserResponse = {
    exists: boolean;
    user: {
        id: string;
        username: string;
        email: string;
        hintword: string;
        user_type: string;
        created_by: string;
        created_on: string;
    };
};
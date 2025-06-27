export interface GoogleAuthResponse {
    exists: boolean;
    user: UserInfo;
}

export interface UserInfo {
    id: string;
    username: string;
    email: string;
    hintword: string;
    user_type: string;
    created_by: string;
    created_on: string;
}

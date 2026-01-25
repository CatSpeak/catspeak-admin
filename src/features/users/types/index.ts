export interface Account {
    accountId: number;
    username: string;
    email: string;
    avatarImageUrl: string | null; // API might return empty string or null
    level: string;
    status: number;
    roleId: number;
    roleName: string | null;
}

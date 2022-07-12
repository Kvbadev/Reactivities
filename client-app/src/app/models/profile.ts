export interface Profile {
    username: string;
    displayName: string;
    image?: string;
    bio?: string;
    photos?: Photo[];
}

export class Profile implements Profile {
    constructor(user: Profile){
        this.username = user.username;
        this.displayName = user.displayName;
        this.image = user.image;
        this.bio = user.bio;
    }
}

export interface Photo {
    id: string;
    url: string;
    isMain: boolean;
}
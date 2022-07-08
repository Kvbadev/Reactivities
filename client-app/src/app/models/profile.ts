import { StringifyOptions } from "querystring";

export interface Profile {
    username: string;
    displayName: string;
    image?: string;
    bio?: string;
}

export class Profile implements Profile {
    constructor(user: Profile){
        this.username = user.username;
        this.displayName = user.displayName;
        this.image = user.image;
        this.bio = user.bio;
    }
}
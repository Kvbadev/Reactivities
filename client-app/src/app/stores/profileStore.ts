import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Photo, Profile } from "../models/profile";
import ActivityStore from "./activityStore";
import { store, useStore } from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;
    updating = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isCurrentUser() {
        if(store.userStore.user && this.profile){
            return store.userStore.user.username === this.profile.username;
        }
        return false;
    }

    loadProfile = async (username: string) => {
        this.loadingProfile = true;
        try{
            const profile = await agent.Profiles.get(username);
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            })
        } catch(error){
            console.log(error);
            runInAction(() => this.loadingProfile = false);
        }
    }

    uploadPhoto = async (file: Blob) => {
        this.uploading = true;
        try{
            const response = await agent.Profiles.uploadPhoto(file);
            const photo = response.data;
            runInAction(() => {
                if(this.profile) {
                    this.profile.photos?.push(photo);
                    if(photo.isMain && store.userStore.user) {
                        store.userStore.setImage(photo.url);
                        this.profile.image = photo.url;
                    }
                }
                this.uploading = false;
            })

        } catch(error){
            console.log(error);
            runInAction(() => this.uploading = false)
        }
    }

    setMainPhoto = async (photo: Photo) => {
        this.loading = true;
        try{
            await agent.Profiles.setMainPhoto(photo.id);
            store.userStore.setImage(photo.url);
            runInAction(() => {
                if(this.profile && this.profile.photos){
                    this.profile.photos.find(p => p.isMain)!.isMain = false;
                    this.profile.photos.find(p => p.id === photo.id)!.isMain = true;
                    this.profile.image = photo.url;
                    this.loading = false;
                }
            })

        } catch(error){
            console.log(error);
            runInAction(() => this.loading = false)
        }
    }

    deletePhoto = async (id: string) => {
        try{
            this.loading = true;
            await agent.Profiles.deletePhoto(id);
            runInAction(() => {
                this.profile!.photos = this.profile?.photos?.filter(p => p.id !== id);
                this.loading = true;
            })
        } catch(error){
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    updateUser = async (updatedProfile: Partial<Profile>) => {
        this.updating = true;
        try{
            await agent.Profiles.updateProfile(updatedProfile);
            runInAction(() => {
                this.profile = {...this.profile, ...updatedProfile} as Profile;
                console.log(this.profile);
            })

        } catch (error) {
            runInAction(() => this.updating = false);
            console.log(error);
        }
    }
}
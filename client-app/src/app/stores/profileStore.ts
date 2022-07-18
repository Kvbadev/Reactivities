import { format } from "date-fns";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { Photo, Profile } from "../models/profile";
import { UserActivity } from "../models/userActivity";
import { store} from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;
    loadingFollowings = false;
    updating = false;
    followings: Profile[] = [];
    activeTab: number = 0;
    events: UserActivity[] = [];
    activeEvent = 0;
    loadingEvents = false;

    constructor() {
        makeAutoObservable(this);

        reaction(
            () => this.activeTab,
            activeTab => {
                if (activeTab === 3 || activeTab === 4) {
                    const predicate = activeTab === 3 ? 'followers' : 'following';
                    this.loadFollowings(predicate);
                } else {
                    this.followings = [];
                }
            }
        )

        reaction(
            () => this.activeEvent,
            activeEvent => {
                if(activeEvent < 3 && activeEvent >= 0){
                    let predicate = '';
                    if(activeEvent === 0) predicate = 'past';
                    else if(activeEvent === 1) predicate = 'future';
                    if(activeEvent === 2) predicate = 'host';

                    this.loadProfileActivities(predicate);
                }
                else this.events = [];

            }
        )
    }

    setActiveTab = (activeTab: any) => {
        this.activeTab = activeTab;
    }

    setActiveEvent = (activeEvent: any) => {
        this.activeEvent = activeEvent;
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
                this.updating = false;
            })

        } catch (error) {
            console.log(error);
            runInAction(() => this.updating = false);
        }
    }

    updatefollowing = async (username: string, following: boolean) => {
        this.loading = true;
        try{
            await agent.Profiles.updateFollowing(username);
            store.activityStore.updateAttendeeFollowing(username);
            console.log(username, this.profile!.username, store.userStore.user?.username);
            runInAction(() => {
                if(this.profile && this.profile.username !== store.userStore.user?.username && this.profile.username === username){
                    following ? this.profile.followersCount! ++
                        : this.profile.followersCount! --
                    this.profile.following = !this.profile.following;
                }
                if(this.profile && this.profile.username === store.userStore.user?.username){
                    following ? this.profile.followingCount!++ : this.profile.followingCount!--
                }
                this.followings.forEach(profile => {
                    if(profile.username === username) {
                        profile.following ? profile.followersCount! -- : profile.followersCount! ++;
                        profile.following = !profile.following;
                    }
                })
                this.loading = false;
            })

        } catch(error){
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    loadFollowings = async (predicate: string) => {
        this.loadingFollowings = true;
        try{
            const followings = await agent.Profiles.listFollowings(this.profile!.username, predicate);
            runInAction(() => {
                this.followings = followings;
                this.loadingFollowings = false;
            })

        } catch(error){
            console.log(error);
            runInAction(() => this.loadingFollowings = false)
        }
    }

    loadProfileActivities = async (predicate: string) => {
        this.loadingEvents = true;
        try{
            const events = await agent.Profiles.getProfileActivities(this.profile!.username, predicate);
            runInAction(() => {
                this.events = events;
                this.loadingEvents = false;
            })


        } catch (error) {
            console.log(error);
            this.loadingEvents = false;
        }
    }
}
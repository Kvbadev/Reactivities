import { makeAutoObservable, runInAction } from "mobx";
import { history } from "../..";
import agent from "../api/agent";
import { Profile } from "../models/profile";
import { User, UserFormValues } from "../models/user";
import { store } from "./store";

export default class UserStore {
    user: User | null = null;
    fbAccessToken: string | null = null;
    fbLoading = false;
    refreshTokenTimeout: any;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async(creds: UserFormValues) => {
        try {
            const user = await agent.Account.login(creds);
            store.commonStore.setToken(user.token);
            this.startRefrestTokenTimer(user);
            runInAction(() => this.user = user);
            history.push('/activities');
            store.modalStore.closeModal();
        } catch(error){
            throw error;
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        window.localStorage.removeItem('jwt');
        this.user = null;
        store.activityStore.clearActivities();
        history.push('/');
    }

    getUser = async () => {
        try{
            const user = await agent.Account.current();
            store.commonStore.setToken(user.token);
            runInAction( () => this.user = user);
            this.startRefrestTokenTimer(user);
        } catch(error){
            console.log(error);
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            await agent.Account.register(creds);
            history.push(`/account/registerSuccess?email=${creds.email}`);
            store.modalStore.closeModal();
        } catch(error){
            throw error;
        }
    }

    setImage = (image: string) => {
        if(this.user){
            this.user.image = image;
        }
    }

    updateDisplayname = async (updatedProfile: Partial<Profile>) => {
        if(this.user){
            this.user.displayName = updatedProfile.displayName as string;
        }
    }

    getFacebookLoginStatus = async () => {
        setTimeout(() => { //to prevent FB is not defined
            window.FB.getLoginStatus(response => {
                if (response.status === 'connected'){
                    this.fbAccessToken = response.authResponse.accessToken;
                }
            })
        })
    }

    facebookLogin = () => {
        this.fbLoading = true;
        const apiLogin = (accessToken: string) => {
            agent.Account.fbLogin(accessToken).then(user => {
                store.commonStore.setToken(user.token);
                this.startRefrestTokenTimer(user);
                runInAction(() => {
                    this.user = user;
                    this.fbLoading = false;
                })
                history.push('/activities');
            }).catch(error => {
                console.log(error);
                runInAction(() => this.fbLoading = false);
            })
        }
        if(this.fbAccessToken){
            apiLogin(this.fbAccessToken);
        } else {
            window.FB.login(response => {
                try{
                    apiLogin(response.authResponse.accessToken);
                } catch(error) {
                    runInAction(()=>this.fbLoading = false);
                    console.log(error);
                }
            },{scope: 'public_profile,email'})
        }
    }

    refreshToken = async () => {
        this.stopRefrestTokenTimer();
        try {
            const user = await agent.Account.refreshToken();
            runInAction(() => this.user = user);
            store.commonStore.setToken(user.token);
            this.startRefrestTokenTimer(user);

        } catch (error) {
            console.log(error);
        }
    }

    private startRefrestTokenTimer(user: User) {
        // const jwtToken = JSON.parse(Buffer.from(user.token.split('.')[1], 'utf-8').toString('base64'));
        const jwtToken = JSON.parse(atob(user.token.split('.')[1]));
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (30 * 1000); //30 seconds before expired
        this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
    }

    private stopRefrestTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}
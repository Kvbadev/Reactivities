import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../app/layout/loadingComponent";
import { useStore } from "../../app/stores/store";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";

export default observer( function ProfilePage() {
    const {username} = useParams<{username: string}>();
    const {profileStore} = useStore();
    const {loadProfile, loadingProfile, profile, setActiveTab, setActiveEvent} = profileStore;

    useEffect(() => {
        loadProfile(username);
        return () => {
            setActiveTab(0);
            setActiveEvent(3);
        }
    }, [loadProfile, username, setActiveTab, setActiveEvent])

    if(loadingProfile) return <LoadingComponent content="Loading profile..." />
    return (
        <Grid>
            <Grid.Column width={16}>
                {profile && 
                <>
                    <ProfileHeader profile={profile}/>
                    <ProfileContent profile={profile}/>
                </>
                }
            </Grid.Column>
        </Grid>
    )
});
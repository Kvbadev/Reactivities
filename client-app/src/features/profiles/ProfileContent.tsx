import { observer } from "mobx-react-lite";
import React, {useState } from "react";
import { Tab } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import { useStore } from "../../app/stores/store";
import ProfileActivities from "./ProfileActivities";
import ProfileEditForm from "./ProfileEditForm";
import ProfileFollowings from "./ProfileFollowings";
import ProfilePhotos from "./ProfilePhotos";

interface Props {
    profile: Profile;
}

export default observer( function ProfileContent({profile}:Props) {
    const {profileStore} = useStore();
    const [editMode, setEditMode] = useState(false);
    const panes = [
        {menuItem: 'About', render: () => <Tab.Pane><ProfileEditForm editMode={editMode} setEditMode={setEditMode}/></Tab.Pane>},
        {menuItem: 'Photos', render: () => <Tab.Pane><ProfilePhotos profile={profile}/></Tab.Pane>},
        {menuItem: 'Events', render: () => <Tab.Pane><ProfileActivities /></Tab.Pane>},
        {menuItem: 'Followers', render: () => <ProfileFollowings />},
        {menuItem: 'Following', render: () => <ProfileFollowings />} 
    ]
    return (
        <Tab 
            menu={{fluid: true, vertical: true}}
            menuPosition='right'
            panes={panes}
            onTabChange={(e, data) => profileStore.setActiveTab(data.activeIndex)}
        />
    )
});
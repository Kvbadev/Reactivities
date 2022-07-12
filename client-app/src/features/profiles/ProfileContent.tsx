import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Tab } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import ProfileEditForm from "./ProfileEditForm";
import ProfilePhotos from "./ProfilePhotos";

interface Props {
    profile: Profile;
}

export default observer( function ProfileContent({profile}:Props) {
    const [editMode, setEditMode] = useState(false);
    const panes = [
        {menuItem: 'About', render: () => <Tab.Pane><ProfileEditForm editMode={editMode} setEditMode={setEditMode}/></Tab.Pane>},
        {menuItem: 'Photos', render: () => <Tab.Pane><ProfilePhotos profile={profile}/></Tab.Pane>},
        {menuItem: 'Events', render: () => <Tab.Pane>Events Content</Tab.Pane>},
        {menuItem: 'Followers', render: () => <Tab.Pane>Followers Content</Tab.Pane>},
        {menuItem: 'Following', render: () => <Tab.Pane>Following Content</Tab.Pane>}
    ]
    return (
        <Tab 
            menu={{fluid: true, vertical: true}}
            menuPosition='right'
            panes={panes}
        />
    )
});
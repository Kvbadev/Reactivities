import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Image } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";

interface Props {
    profile: Profile;
}

export default observer( function ProfileCard({profile}:Props) {
    return (
        <Card as={Link} to={`/profiles/${profile.username}`}>
            <Card.Content>
                <Image size="small" src={profile.image || '/assets/user.png'} />
            </Card.Content>
            <Card.Content>
                <Card.Header>{profile.displayName}</Card.Header>
                <Card.Header>{profile.bio!.length > 20 ? profile.bio?.slice(0, 20)+'...' : profile.bio}</Card.Header>
            </Card.Content>
            <Card.Content extra>
                <Icon name='user' />
                20 Followers
            </Card.Content>
        </Card>
    )
})
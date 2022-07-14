import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import { Card, Icon, Image } from "semantic-ui-react";
import { Profile } from "../../app/models/profile";
import FollowButton from "./FollowButton";

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
                <Card.Description>{profile.bio && profile.bio!.length > 20 ? profile.bio?.slice(0, 20)+'...' : profile.bio}</Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Icon name='user' />
                {profile.followersCount} Followers
            </Card.Content>
            <FollowButton profile={profile} />
        </Card>
    )
})


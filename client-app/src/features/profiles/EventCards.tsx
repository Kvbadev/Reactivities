import { format } from "date-fns";
import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import { Card, Image, Tab } from "semantic-ui-react";
import { UserActivity } from "../../app/models/userActivity";

interface Props {
    loading: boolean;
    events: UserActivity[];
}

export default observer( function EventCards({loading, events}:Props) {
    return (
        <Tab.Pane loading={loading}>
            <Card.Group itemsPerRow={4}>
            {events.map((ev) => (
                <Card key={ev.id} as={Link} to={`/activities/${ev.id}`}>
                    <Card.Content>
                        <Image size="medium" src={`/assets/categoryImages/${ev.category}.jpg`} />
                    </Card.Content>
                    <Card.Content>
                        <Card.Header>{ev.title}</Card.Header>
                        <Card.Description >{format(new Date(ev.date), 'do LLL')}</Card.Description>
                        <Card.Description>{format(new Date(ev.date), 'h:mm a')}</Card.Description>
                    </Card.Content>
                </Card>
            ))}
            </Card.Group>
        </Tab.Pane>
    )
})
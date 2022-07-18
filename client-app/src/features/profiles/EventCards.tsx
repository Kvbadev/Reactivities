import { format } from "date-fns";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Grid, Image, Tab } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";

export default observer( function EventCards() {
    const {profileStore} = useStore();
    const {loadingEvents: loading, events} = profileStore;

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
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react"
import { Grid, Header, Segment, Tab } from "semantic-ui-react"
import { useStore } from "../../app/stores/store";
import EventCards from "./EventCards";

export default observer( function ProfileActivities() {
    const {profileStore: {setActiveEvent, loadProfileActivities}} = useStore();
    const panes = [
        {
          menuItem: 'Past Activities',
          render: () => <EventCards />
        },
        {
          menuItem: 'Future Activities',
          render: () => <EventCards />
        },
        {
          menuItem: 'Hosting',
          render: () => <EventCards />
        },
    ]
    useEffect(() => {
        loadProfileActivities('past'); //hard coded past because menu's gonna change its index to 0 anyway
    },[])

    return (
        <>
            <Grid>
                <Grid.Column width={16}>
                    <Header floated="left" icon='calendar' content='Activities' />
                </Grid.Column>
                <Grid.Column width={16}>
                    <Tab 
                        menu={{ secondary: true, pointing: true}}
                        panes={panes}
                        onTabChange={(e, data) => setActiveEvent(data.activeIndex)}
                    />
                </Grid.Column>
            </Grid>
        </>
    )
})
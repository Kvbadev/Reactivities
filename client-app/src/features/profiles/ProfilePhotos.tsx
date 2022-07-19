import { observer } from "mobx-react-lite";
import React, { SyntheticEvent, useState } from "react";
import { Card, Header, Tab, Image, Grid, Button } from "semantic-ui-react";
import PhotoUploadWidget from "../../app/common/imageUpload/PhotoUploadWidget";
import { Photo, Profile } from "../../app/models/profile";
import { useStore } from "../../app/stores/store";

interface Props {
    profile: Profile;
}

export default observer( function ProfilePhotos({profile}:Props) {
    const {profileStore: {isCurrentUser, uploading, deletePhoto, uploadPhoto, loading, setMainPhoto}} = useStore();
    const [addPhotoMode, setAddPhotoMode] = useState(false);
    const [target, setTarget] = useState('');
    const {activityStore} = useStore();

    function handlePhotoUpload(file: Blob) {
        uploadPhoto(file).then(() => setAddPhotoMode(false));
    }

    function handleSetMainPhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>){
        setTarget(e.currentTarget.name);
        setMainPhoto(photo);

        //apply changes in activity dashboard
        activityStore.activityRegistry.forEach( a => {
            const t = a.attendees.find(at => at.username === 'bob')
            if(t) {
                t.image = photo.url;
                a.host!.image = photo.url;
            }
        })
    }

    function handleDeletePhoto(e: SyntheticEvent<HTMLButtonElement>, id: string){
        setTarget(e.currentTarget.name);
        deletePhoto(id);
    }

    return (
        <Grid>
            <Grid.Column width={16}>
                <Header floated="left" icon='image' content='Photos' />
                {isCurrentUser && (
                    <Button floated='right' basic 
                        content={addPhotoMode ? 'Cancel' : 'Add Photo'} 
                        onClick={() => setAddPhotoMode(!addPhotoMode)}    
                    />
                )}
            </Grid.Column>
            <Grid.Column width={16}>
                {addPhotoMode ? (
                    <PhotoUploadWidget uploadPhoto={handlePhotoUpload} loading={uploading}/>
                ) : (
                    <>
                    {profile.photos?.length !== 0 && 
                    <Tab.Pane>
                        <Card.Group itemsPerRow={5}>
                            {profile.photos?.map(photo => (
                                <Card key={photo.id}>
                                    <Image src={photo.url} />
                                    {isCurrentUser && (
                                        <Button.Group fluid widths={2}>
                                            <Button 
                                                basic
                                                color='green'
                                                content='Main'
                                                name={photo.id}
                                                disabled={photo.isMain}
                                                loading={target === photo.id && loading}
                                                onClick={e => handleSetMainPhoto(photo, e)}
                                            />
                                            <Button 
                                                name={photo.id + 'del'} 
                                                loading={target === photo.id+'del' && loading}
                                                onClick={e => handleDeletePhoto(e, photo.id)} 
                                                disabled={photo.isMain} 
                                                basic color='red' icon='trash' 
                                            />
                                        </Button.Group>
                                    )}
                                </Card>
                            ))}
                        </Card.Group>
                    </Tab.Pane>
                    }
                    </>
                )}
            </Grid.Column>
        </Grid>
    )
});
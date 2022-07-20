import { Form, Formik} from "formik";
import React from "react";
import { Button, Grid, Header, Item} from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';
import { observer } from "mobx-react-lite";
import MyTextInput from "../../app/common/form/MyTextInput";
import MyTextArea from "../../app/common/form/MyTextArea";
import { Profile } from "../../app/models/profile";
interface Props {
    editMode: boolean;
    setEditMode: (value: boolean) => void;
}

export default observer( function ProfileEditForm({editMode, setEditMode}:Props) {
    const {profileStore, userStore, activityStore} = useStore();

    function handleEdit () {
        setEditMode(!editMode)
    }

    const validationSchema = Yup.object({
        displayName: Yup.string().required()
    });

    const initialValues = {
        displayName: profileStore.profile?.displayName,
        bio: profileStore.profile?.bio || ''
    }

    async function handleFormSubmit (values: Partial<Profile>) {
        try{
            const prevDName = profileStore.profile?.displayName;
            await profileStore.updateUser(values);
            userStore.updateDisplayname(values);
            activityStore.activityRegistry.forEach((act) => {
                const toChange = act.attendees.find(x => x.displayName === prevDName);
                if(toChange){
                    toChange.displayName = values.displayName as string;
                    toChange.bio = values.bio;
                } 
                if(act.host?.displayName === prevDName) act.host!.displayName= values.displayName as string;
            })
            setEditMode(false);

        } catch(error){
            console.log(error);
        }
    }

    return (
        <>
        <Grid>
            <Grid.Column width={16}>
                <Header floated="left" icon='user' content={`About  ${profileStore.profile?.displayName}`} />
                {profileStore.profile?.username === userStore.user?.username &&
                <Button basic attached='right' color={editMode ? 'red' : 'teal'} content={editMode ? 'Cancel' : 'Edit Profile'} onClick={() => handleEdit()} floated='right'/>}
            </Grid.Column>
        </Grid>
            {!editMode ? (
                <Item.Group>
                    <Item>
                        <Item.Content>
                            {profileStore.profile?.bio}
                        </Item.Content>
                    </Item>
                </Item.Group>
            ) : (
            <Grid>
                <Grid.Column width={16}>
                    <Formik
                        initialValues={initialValues} 
                        onSubmit={ (values:Partial<Profile>) => handleFormSubmit(values)}
                        validationSchema={validationSchema} >
                        {({isValid, isSubmitting, dirty}) => (
                            <Form className="ui form" autoComplete='off' >
                                <MyTextInput placeholder={"Display Name"} name={"displayName"} />
                                <MyTextArea placeholder={"Your Bio"} name={"bio"} rows={2} />
                                <Button type="submit" loading={isSubmitting} color='green' content='Submit' disabled={!isValid || !dirty} />
                            </Form>
                        )}
                    </Formik>
                </Grid.Column>
            </Grid>
            )}
        </>
    )
});
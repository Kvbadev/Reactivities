import { Field, Form, Formik, FormikHelpers, FormikValues } from "formik";
import React from "react";
import { Button, Header, Icon, Item, Label, Segment } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import * as Yup from 'yup';
import { observer } from "mobx-react-lite";
import { act } from "react-dom/test-utils";

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
        displayName: Yup.string().required(),
        bio: Yup.string().required()
    });

    const initialValues = {
        displayName: profileStore.profile?.displayName,
        bio: profileStore.profile?.bio
    }

    async function handleFormSubmit (values: any) {
        // const user = new Profile({...profileStore.profile, ...values});
        try{
            const prevDName = profileStore.profile?.displayName;
            await profileStore.updateUser({...values});
            userStore.updateDisplayname({...values});
            activityStore.activityRegistry.forEach((act) => {
                const toChange = act.attendees.find(x => x.displayName === prevDName);
                if(toChange){
                    toChange.displayName = values.displayName;
                    toChange.bio = values.bio;
                } 
                if(act.host?.displayName === prevDName) act.host!.displayName= values.displayName;
            })
            setEditMode(false);

        } catch(error){
            console.log(error);
        }
    }

    return (
        <>
            {!editMode ? (
                <Item.Group>
                    <Item>
                        <Icon name='user' size="big"/>
                        <Item.Content verticalAlign="middle">
                            <Header as='h1'>About {profileStore.profile!.displayName}</Header>
                        </Item.Content>
                        <Button basic attached='right' color="teal" content='Edit Profile' onClick={() => handleEdit()}/>
                    </Item>
                    <Item>
                        <Item.Content>
                            {profileStore.profile?.bio}
                        </Item.Content>
                    </Item>
                </Item.Group>
            ) : (
                <>
                <>
                    <Button basic attached='right' color='red' content='Cancel' onClick={() => handleEdit()}/>
                </>

                <Formik
                    initialValues={initialValues} 
                    onSubmit={ (values:any) => handleFormSubmit(values)}
                    validationSchema={validationSchema} >
                    {({handleSubmit, isValid, isSubmitting, dirty}) => (
                        <Form className="ui form" onSubmit={handleSubmit} autoComplete='off' >
                            <Field placeholder='Display Name' name="displayName" type='text' />
                            <Field as='textarea' name="bio" placeholder='Your bio here' />
                            <Button type="submit" loading={isSubmitting} color='green' content='Submit' disabled={!isValid || !dirty} onClick={() => handleSubmit} />
                        </Form>
                        // <Button loading={isSubmitting} />
                    )}
                </Formik>
                </>
            )}
        </>
    )
});
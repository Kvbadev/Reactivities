import { ErrorMessage, Form, Formik } from "formik";
import { observer } from "mobx-react-lite";
import React from "react";
import { Button, Header, Label } from "semantic-ui-react";
import MyTextInput from "../../app/common/form/MyTextInput";
import { useStore } from "../../app/stores/store";
import * as yup from 'yup';

export default observer( function RegisterForm() {
    const {userStore} = useStore();
    return (
        <Formik
            initialValues={{displayName: '', username: '', email: '', password: '', error: null}}
            onSubmit={(values, {setErrors}) => userStore.register(values).catch(error => {
                setErrors({error}) //formik will associate handleSubmit with this method
            })}
            validationSchema = {yup.object({
                displayName: yup.string().required(),
                username: yup.string().required(),
                email: yup.string().required().email(),
                password: yup.string().required()
            })}
        >
            {({handleSubmit, isSubmitting, errors, isValid, dirty}) => (
                <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                    <Header as='h2' content='Sign up to Reactivities' color='teal' textAlign="center" />
                    <MyTextInput name="displayName" placeholder="Display Name" />
                    <MyTextInput name="username" placeholder="Username" />
                    <MyTextInput name="email" placeholder="Email" />
                    <MyTextInput name="password" type='password' placeholder="Password" />
                    <ErrorMessage
                        name="error" render={() => <Label style={{marginBottom: 10}} basic color='red' content={errors.error ? errors.error : 'Invalid value'}/> //errors doesn't work for some reason
                    } />
                    <Button positive content="Register" disabled={!isValid || !dirty || isSubmitting} loading={isSubmitting} type="submit" fluid />
                </Form>
            )}

        </Formik>
    )
});
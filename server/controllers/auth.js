/*
- Forgot Password flow
Method: One time password

1. Present the forgot password page

2. Type in email address, let page generate OTP if email exists, state on the page ‘if the email address is valid you will have a One Time Password, via email, please type it below.
    1. on OTP generate:
        PW is generated and saved in document
        temp_password = true
        expiration_timestamp_OTP is set to current time + 15 min
    2. on /validateOTP with OTP
        if expiration_timestamp_OTP NOT null and current time > expiration_timestamp_OTP: failed login, display "expired, click resend"
        else if expiration_timestamp_OTP it is just normal log in (verb), will catch if temp_password = true due to initial creation from management which forces to go to update password page

3. Email gets generated from the page, so no moving off the page, do validation to compare both codes with a retry option to send another OTP.
    1. validation is just checking the collection has the email and temp_pass. Set expiration_timestamp_OTP to current time so OTP cannot be used again.

4. If validated, present new password field with a duplicate field to make sure typed properly, make sure password meets min requirements, if so save new password.
    1. On successful PW change, /updatePassword/:id:
        1. Only way to change expiration_timestamp_OTP to null and temp_password = false
        
requests
    /forgotPassword
        POST - submitting email and DB change for document with Email
            1. Email
        Server
            1. Generates temp pass and updates document
            2. Emails the user the OTP
        response:
            if user exists, return _id, email

    /validateOTP/:id
        POST - sensitive data (OTP)
            1. _id
            2. email
            3. OTP
        Server
            1. validates if not expired and all correct
        response
            if correct, returns user doc
            else notFound

    /updatePassword/:id
        PATCH - sent fields to change
            1. new password
        Server
            1. update OTP fields and new password
        response
            returns user doc

    After, on client it will call a /login with the new info to "log in" the user so the client gets the JWT and refreshToken and redirect to user panel
*/
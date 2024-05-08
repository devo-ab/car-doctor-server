/**
 * ----------------------
 *      Make API Secure
 * ----------------------
 * 
 * The Person who should have
 * 
 * Concept
 * 1. assign two tokens for each person (access token and refresh token)
 * 2. access token contains : user identification (email, role etc.) valid for a shorter duration
 * 3. refresh token is used : to recreate an access token that was expired.
 * 4. if refresh token is invalid then log out the user
 */


/**
 * 1. jwt --> json web token
 * 2. generate a token by using jwt.sign
 * 3. create api set to cookie. (httponly, secure, samesite)
 * 4. from client side : axios withCredentials:true
 * 5. cors setup origin and credentials : true (or withCredentials: include while using fetch)
 */


/**
 * 1. for secure api calls
 * 2. server side : install cookie parser and use it as a middleware
 * 3. req.cookies
 * 4. on the client side : make api call using axios withCredentials true
 */
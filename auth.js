// Dependencies
const jwt = require("jsonwebtoken");

// Secret
const secret = "CourseBookingAPI";

// [SECTION] Token Creation Function
/*
	Analogy:
		Pack the gift and provide a lock with the secret code as the key
*/
module.exports.createAccessToken = (user) => {

	// When the user logs in, a token will be generated with user's information
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	// Generate a JSON web token using the jwt's sign method
	// Generates the token using the form data and the secret code with no additional optios provided
	// data = payload, secret = secret(signature), {} = options(currently none)
	return jwt.sign(data, secret, {});
}

// [SECTION] Token Verification Function
/*
	Analogy:
		Receive the gift and open the lock to verify if the sender is legitimate and the gift was not tampered with.

*/
module.exports.verify = (req, res, next) => {

	//console.log(req.headers.authorization);

	let token = req.headers.authorization;


	if(typeof token === "undefined"){
		console.log("Failed. No token")
		return res.send(false);

	} else {
		/*
			Example token received:

			Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxZjBjMzYyNmNhYzJjM2VhYTBmY2I5YSIsImVtYWlsIjoic3BpZGVybWFuM0BnbWFpbC5jb20iLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjQzMjQ1MTEyfQ.c29qelk9GkrnZP10M6wqo6fiTKHPk-c15DcpSBsKq7I
		*/
		// To remove the "Bearer " character from the auth header
		token = token.slice(7, token.length);

		//console.log(token);

		// Token decryption

		// Validate the token using the "verify" method decrypting the token using the secret code
		jwt.verify(token, secret, function(err, decodedToken){

			if(err){
				console.log(err.message);
				return res.send(false);

			} else {
				//console.log(decodedToken); //contains the data from our token

				// user property will be added to request object and will contain our decodedToken
				req.user = decodedToken

				next()
				// middleware function
				// next() will let us proceed to the next middleware or controller
			}

		});
	}


};


// [SECTION] Verify Admin Middleware
module.exports.verifyAdmin = (req, res, next) => {

	if(req.user.isAdmin){
		// If the logged in user, based on his token is an admin, we will proceed to the next middleware/controller
		next();

	} else {
		console.log("Failed, Action Forbidden")
		return res.send(false);
	}
}
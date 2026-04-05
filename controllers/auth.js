exports.getLogin = ((req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.isLoggedIn
    });
})


exports.postLogin = ((req, res, next) => {
    req.isLoggedIn = true;  //setting it to true for now but issue is it will be true for all users
    // after res.redirect() the request is over and the response is sent to the client
    //solution is to use sessions or cookies because they are stored on the server and this data is sent with every request

    res.redirect('/');
})


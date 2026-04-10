exports.getLogin = ((req, res, next) => {
    // const isLoggedIn = (req.get('Cookie')
    //     .trim()
    //     .split('=')[1] === 'true'
    // );
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
})


exports.postLogin = ((req, res, next) => {
    req.session.isLoggedIn = true;
    res.redirect('/');
})

exports.postLogout = ((req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
});

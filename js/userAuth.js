(function (jQuery, Firebase, Path) {
    "use strict";

    // the main firebase reference
    var rootRef = new Firebase('http://YOUR-URL.com');

    // pair our routes to our form elements and controller
    var routeMap = {
        '#/queue': {
            form: 'frmQueue',
            controller: 'queue',
            authRequired: true // must be logged in to get here
        },
        '#/profile': {
            form: 'frmProfile',
            controller: 'profile',
            authRequired: true // must be logged in to get here
        },
        '#/login': {
            form: 'frmLogin',
            controller: 'login'
        },
        '#/logout': {
            form: 'frmLogout',
            controller: 'logout'
        },
        '#/register': {
            form: 'frmRegister',
            controller: 'register'
        },
        '#/forgotPassword': {
            form: 'frmForgotPassword',
            controller: 'forgotPassword'
        },
        '#/changePassword': {
            form: 'frmChangePassword',
            controller: 'changePassword',
            authRequired: true, // must be logged in to get here
            accountRequired: true // must have an account to get here
        },
        '#/changeEmail': {
            form: 'frmChangeEmail',
            controller: 'changeEmail',
            authRequired: true, // must be logged in to get here
            accountRequired: true // must have an account to get here
        },
    };

    // create the object to store our controllers
    var controllers = {};

    // store the active form shown on the page
    var activeForm = null;

    function routeTo(route) {
        window.location.href = '#/' + route;
    }

    // Handle Email/Password login
    // returns a promise
    function authWithPassword(userObj) {
        var deferred = $.Deferred();
        rootRef.authWithPassword(userObj, function onAuth(err, user) {
            if (err) {
                deferred.reject(err);
            }
            if (user) {
                deferred.resolve(user);
            }
        });
        return deferred.promise();
    }

    // authenticate anonymously
    // returns a promise
    function authAnonymously() {
        var deferred = $.Deferred();
        rootRef.authAnonymously(function (err, authData) {
            if (authData) {
                deferred.resolve(authData);
            }
            if (err) {
                deferred.reject(err);
            }
        });
        return deferred.promise();
    }
    
    // create a user but not login
    // returns a promsie
    function createUser(userObj) {
        var deferred = $.Deferred();
        rootRef.createUser(userObj, function (err) {
            if (!err) {
                deferred.resolve();
            } else {
                deferred.reject(err);
            }
        });
        return deferred.promise();
    }

    // Create a user and then login in
    // returns a promise
    function createUserAndLogin(userObj) {
        return createUser(userObj)
            .then(function () {
            return authWithPassword(userObj);
        });
    }

    // route to the specified route if sucessful
    // if there is an error, show the alert
    function handleAuthResponse(promise, route) {
        $.when(promise)
            .then(function (authData) {
                showAlert({
                    title: '',
                    detail: '',
                    className: 'hidden'
                });
                
                // route
                routeTo(route);
            }, function (err) {
                // pop up error
                showAlert({
                    title: err.code,
                    detail: err.message,
                    className: 'alert-danger'
                });
        });
    }
    
    // changes the users password
    function changePassword(userObj) {
        var deferred = $.Deferred();
        rootRef.changePassword(userObj, function onComplete(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve();
                // show the message if write is successful
                showAlert({
                    title: 'Successfully saved!',
                    className: 'alert-success'
                });
            }
        });
        return deferred.promise();
    }
    

    // options for showing the alert box
    function showAlert(opts) {
        var title = opts.title;
        var detail = opts.detail;
        var className = 'alert ' + opts.className;
        var alertBox = $('#alert');
        
        alertBox.removeClass().addClass(className);
        alertBox.children('#alert-title').text(title);
        alertBox.children('#alert-detail').text(detail);
    }

    /// Controllers
    ////////////////////////////////////////

    controllers.login = function (form) {
        // Form submission for logging in
        form.on('submit', function (e) {
            e.preventDefault();
            var userObj = $(this).serializeObject();
            var loginPromise = authWithPassword(userObj);

            handleAuthResponse(loginPromise, 'profile');
        });
        
        form.find('#btnGuest').on('click', function (e) {
            e.preventDefault();
            handleAuthResponse(authAnonymously(), 'profile');
        });
    };

    // logout immediately when the controller is invoked
    controllers.logout = function (form) {
        rootRef.unauth();
    };

    controllers.register = function (form) {
        // Form submission for registering
        form.on('submit', function (e) {
            e.preventDefault();
            var userObj = $(this).serializeObject();
            var loginPromise = createUserAndLogin(userObj);

            handleAuthResponse(loginPromise, 'profile');
        });

    };

    controllers.profile = function (form) {
        // Check the current user
        var userAuth = rootRef.getAuth();
        var userRef;

        // If no current user send to login page
        if (!userAuth) {
            routeTo('login');
            return;
        }

        // Load user info
        userRef = rootRef.child('users').child(userAuth.uid);
        userRef.once('value', function (snapshot) {
            var user = snapshot.val();
            
            // userAuth fields
            if(userAuth.password) {
                form.find('#gravatar').attr("src", userAuth.password.profileImageURL);
                // user fields
                form.find('#name').val(user.name);
                form.find('#mainCharacter').val(user.mainCharacter);
            } else {
                form.find('#gravatar').attr("src", "http://www.gravatar.com/avatar/00000000000000000000000000000000");
            }
        });

        // Save user's info to Firebase
        form.on('submit', function (e) {
            e.preventDefault();
            var userInfo = $(this).serializeObject();

            userRef.set(userInfo, function onComplete() {
                // show the message if write is successful
                showAlert({
                    title: 'Successfully saved!',
                    className: 'alert-success'
                });
            });
        });
    };
    
    controllers.changePassword = function (form) {
        // Check the current user
        var userAuth = rootRef.getAuth();
        var userRef;

        // If no current user send to login page
        if (!userAuth || userAuth.anonymous) {
            routeTo('login');
            return;
        }
        
        // Form submission for logging in
        form.on('submit', function (e) {
            e.preventDefault();
            var userObj = $(this).serializeObject();
            if(!userObj.newPassword) {
                showAlert({
                    title: 'Enter a new password',
                    className: 'alert-danger'
                });
                return;
            } else if(userObj.newPassword !== userObj.confirmNewPassword) {
                showAlert({
                    title: 'New Password does not match Confirm New Password',
                    className: 'alert-danger'
                });
                return;
            }
            
            var changePasswordPromise = changePassword(userObj);

            handleAuthResponse(changePasswordPromise, 'logout');
        });
    };

    /// Routing
    ////////////////////////////////////////

    // Handle transitions between routes
    function transitionRoute(path) {
        // grab the config object to get the form element and controller
        var formRoute = routeMap[path];
        var currentUser = rootRef.getAuth();

        // if authentication is required and there is no
        // current user then go to the login page and
        // stop executing
        if (formRoute.authRequired && !currentUser) {
            routeTo('login');
            return;
        }
        
        if(formRoute.accountRequired && currentUser.anonymous) {
            routeTo('register');
            return;
        }

        // wrap the upcoming form in jQuery
        var upcomingForm = $('#' + formRoute.form);

        // if there is no active form then make the current one active
        if (!activeForm) {
            activeForm = upcomingForm;
        }

        // hide old form and show new form
        activeForm.hide();
        upcomingForm.show().hide().fadeIn(750);

        // remove any listeners on the soon to be switched form
        activeForm.off();

        // set the new form as the active form
        activeForm = upcomingForm;

        // invoke the controller
        controllers[formRoute.controller](activeForm);
    }

    // Set up the transitioning of the route
    function prepRoute() {
        transitionRoute(this.path);
    }


    /// Routes
    ///  #/profile  - Profile
    //   #/login    - Login
    //   #/logout   - Logut
    //   #/register - Register

    Path.map("#/profile").to(prepRoute);
    Path.map("#/login").to(prepRoute);
    Path.map("#/logout").to(prepRoute);
    Path.map("#/register").to(prepRoute);
    Path.map("#/forgotPassword").to(prepRoute);
    Path.map("#/changePassword").to(prepRoute);
    Path.map("#/changeEmail").to(prepRoute);

    Path.root("#/profile");

    /// Initialize
    ////////////////////////////////////////

    $(function () {
        // Start the router
        Path.listen();
    });

}(window.jQuery, window.Firebase, window.Path))
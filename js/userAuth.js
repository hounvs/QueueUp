var firebaseApp = 'queueup';

function createUser(email, password) {
    var ref = new Firebase("https://" + firebaseApp +".firebaseio.com");
    ref.createUser({
        email    : email,
        password : password
    }, function(error, userData) {
        if (error) {
            console.log("Error creating user:", error);
        } else {
            console.log("Successfully created user account with uid:", userData.uid);
        }
    });
}

function authWithPassword(email, password) {
    var ref = new Firebase("https://" + firebaseApp +".firebaseio.com");
    ref.authWithPassword({
        email    : email,
        password : password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
      }
    });
}

function changeEmail(oldEmail, newEmail, password) {
    var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
    ref.changeEmail({
      oldEmail : oldEmail,
      newEmail : newEmail,
      password : password
    }, function(error) {
      if (error === null) {
        console.log("Email changed successfully");
      } else {
        console.log("Error changing email:", error);
      }
    });
}

function changePassword(email, oldPassword, newPassword) {
    var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
    ref.changePassword({
      email       : email,
      oldPassword : oldPassword,
      newPassword : newPassword
    }, function(error) {
      if (error === null) {
        console.log("Password changed successfully");
      } else {
        console.log("Error changing password:", error);
      }
    });
}

function resetPassword(email) {
    var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
    ref.resetPassword({
      email : email
    }, function(error) {
      if (error === null) {
        console.log("Password reset email sent successfully");
      } else {
        console.log("Error sending password reset email:", error);
      }
    });
}

function removeUser(email, password) {
    var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
    ref.removeUser({
      email    : email,
      password : password
    }, function(error) {
      if (error === null) {
        console.log("User removed successfully");
      } else {
        console.log("Error removing user:", error);
      }
    });
}
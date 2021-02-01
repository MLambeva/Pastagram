"use strict";

(() => {

    const initDatabase = () => {
        const firebaseConfig = {
            apiKey: "AIzaSyAaurpIbwspzgj841bfWhbU0cwCoTKA0JI",
            authDomain: "pastagram-a309c.firebaseapp.com",
            databaseURL: "https://pastagram-a309c-default-rtdb.firebaseio.com/",
            projectId: "pastagram-a309c",
            storageBucket: "", //"pastagram-a309c.appspot.com",
            messagingSenderId: "544116547888"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
    };
    initDatabase();



    const login = (email, password, callback) => {
        return firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            // Success - redirect
            callback(true);
        }, (error) => {
            const errorCode = error.code;
            //Here we use the error message like it is returned by the firebase (the message is in english)
            const errorMessage = error.message;

            // handle error with login
            callback(false, errorCode, errorMessage);
        });
    };

    const logout = () => {
        return firebase.auth().signOut();
    };

    /**
     * @callback registerCallback
     * @param {boolean} successful if log-in is successful, false otherwise
     * @param {number} errorCode the error code in case successful = false
     * @param {string} errorMessage the error message in case successful = false
     */

    /**
     * Register given user with given information
     *
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @param {registerCallback} callback function to call once the register operation is completed
     *
     **/
    const register = (username, email, password, callback) => {
        firebase.auth().createUserWithEmailAndPassword(email, password).then((data) => {
            data.user.updateProfile({
                displayName: username
            }).then(function () {
                callback(true);
            }, function (error) {
                console.log(error);
            });
        }, (error) => {
            const errorCode = error.code;
            let errorMessage;

            switch (errorCode) {
                case 'auth/weak-password':
                    {
                        errorMessage = "Registration failed. Weak password.";
                        break;
                    }
                case 'auth/email-already-in-use':
                    {
                        errorMessage = "Registration failed. Email is already used.";
                        break;
                    }
                case 'auth/invalid-email':
                    {
                        errorMessage = "Registration failed. Email is not valid.";
                        break;
                    }
                default:
                    {
                        errorMessage = "Registration failed.";
                    }
            }

            callback(false, errorCode, errorMessage);
        });
    };



    const postPasta = (imageURL, imageName) => {
        const currentUser = firebase.auth().currentUser;
        const userDisplayName = currentUser ? currentUser.displayName : "";
        const userId = currentUser ? currentUser.uid : "";
        const db = firebase.database();
        const pastaDbRef = db.ref('pastas/');
        const userDbRef = currentUser ? db.ref('users/' + userId) : undefined;

        if (currentUser) {
            pastaDbRef.push({
                'username': userDisplayName,
                'userId': userId,
                'imageURL': imageURL,
                'imageName': imageName
            });

            if (userDbRef) {

                userDbRef.once('value').then(snapshot => {
                    if (snapshot.val()) {
                        let pastas = parseInt(snapshot.val()['pastas']) + 1;

                        // increment count of posts for current user
                        userDbRef.update({
                            pastas: pastas
                        });
                    } else {
                        userDbRef.set({
                            'pastas': '1'
                        });
                    }
                });
            }
        }
        else {
            window.location = 'login.html?error=accessDenied';
        }
    };

    const deletePasta = id => {
        const db = firebase.database();
        const dbRef = db.ref('pastas/' + id);
        const currentUser = firebase.auth().currentUser;
        const userId = currentUser.uid;
        const userDbRef = db.ref('users/' + userId);

        if (userDbRef) {
            userDbRef.once('value').then(snapshot => {
                if (snapshot.val()) {
                    let pastas = parseInt(snapshot.val()['pastas']) - 1;

                    // decrement count of posts for current user
                    userDbRef.update({
                        pastas: pastas
                    });
                }
            });
        }

        dbRef.remove();
    };

    const favouritePasta = id => {
        const db = firebase.database();
        const currentUser = firebase.auth().currentUser;
        const userId = currentUser.uid;

        const dbRef = db.ref('users/' + userId + '/favourites/' + id);

        dbRef.push({ '1': "1" });
    };

    const unfavouritePasta = id => {
        const db = firebase.database();
        const currentUser = firebase.auth().currentUser;
        const userId = currentUser.uid;

        const dbRef = db.ref('users/' + userId + '/favourites/' + id);

        dbRef.remove();
    };

    const getUserStats = id => {
        const db = firebase.database();
        return db.ref('pastas/' + id);
    };

    this.auth = {
        login: login,
        logout: logout,
        register: register,
        getUserStats: getUserStats
    };

    this.pasta = {
        post: postPasta,
        delete: deletePasta,
        favourite: favouritePasta,
        unfavourite: unfavouritePasta
    };
})(this); 
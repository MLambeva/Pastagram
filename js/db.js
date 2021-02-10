"use strict";

(() => {

    const initDatabase = () => {
        const firebaseConfig = {
            apiKey: "AIzaSyAaurpIbwspzgj841bfWhbU0cwCoTKA0JI",
            authDomain: "pastagram-a309c.firebaseapp.com",
            //databaseURL: "https://pastagram-a309c-default-rtdb.firebaseio.com/",
            projectId: "pastagram-a309c",
            //storageBucket: "pastagram-a309c.appspot.com",
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
            const errorMessage = error.message;

            // Handle login error
            callback(false, errorCode, errorMessage);
        });
    };

    const logout = () => {
        return firebase.auth().signOut();
    };

    /**
     * @callback registerCallback
     * @param {boolean} successful - Wether login is successful
     * @param {number} errorCode - The error code in case successful = false
     * @param {string} errorMessage - The error message in case successful = false
     */

    /**
     * Register given user with given information
     *
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @param {registerCallback} callback - Function to call once the register operation is completed
     *
     **/

    /**
     * @param {string} id - Post ID
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

    const updateDB = db => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://api.npoint.io/636409df8ded0c89c938");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(db));
    }

    const postPasta = (imageURL, imageName) => {
        fetch("https://api.npoint.io/636409df8ded0c89c938").then(response => response.json()).then(db => {
            const pastaDbRef = db.pastas;
            const currentUser = firebase.auth().currentUser;
            const userDisplayName = currentUser ? currentUser.displayName : undefined;
            const userId = currentUser ? currentUser.uid : undefined;

            if (currentUser) {
                if (!Object.prototype.hasOwnProperty.call(db.users, userId)) {
                    db.users[userId] = {
                        "favourites": {}
                    };
                }

                pastaDbRef[db.count] = {
                    'username': userDisplayName,
                    'userId': userId,
                    'imageURL': imageURL,
                    'imageName': imageName
                };
                db.count = parseInt(db.count) + 1;

                updateDB(db);
            }
            else {
                window.location = 'login.html?error=accessDenied';
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    const deletePasta = id => {
        fetch("https://api.npoint.io/636409df8ded0c89c938").then(response => response.json()).then(db => {

            delete db.pastas[id];

            updateDB(db);
        }).catch((err) => {
            console.log(err);
        });
    };

    const favouritePasta = id => {
        fetch("https://api.npoint.io/636409df8ded0c89c938").then(response => response.json()).then(db => {
            const currentUser = firebase.auth().currentUser;
            const userId = currentUser.uid;
            db.users[userId].favourites[id] = 1;

            updateDB(db);
        }).catch((err) => {
            console.log(err);
        });
    };

    const unfavouritePasta = id => {
        fetch("https://api.npoint.io/636409df8ded0c89c938").then(response => response.json()).then(db => {
            const currentUser = firebase.auth().currentUser;
            const userId = currentUser.uid;
            delete db.users[userId].favourites[id];

            updateDB(db);
        }).catch((err) => {
            console.log(err);
        });
    };

    this.auth = {
        login: login,
        logout: logout,
        register: register
    };

    this.pasta = {
        post: postPasta,
        delete: deletePasta,
        favourite: favouritePasta,
        unfavourite: unfavouritePasta
    };

    this.database = {
        update: updateDB
    }
})(this); 
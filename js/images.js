"use strict";

(() => {
    const pastaContainer = document.getElementById('pastas');
    const myPastaContainer = document.getElementById('my-pastas');
    const favPastaContainer = document.getElementById('fav-pastas');
    const uploadPasta = document.getElementById('upload-form');

    firebase.auth().onAuthStateChanged(user => {
        const menu = document.getElementById('menu-buttons');

        if (menu) {
            if (user) {
                createButton(menu, 'logout', "Log out", 'login.html');
            }
            else {
                createButton(menu, 'login', "Log in", 'login.html');
                createButton(menu, 'reg', "Register", 'register.html');
            }

            populateContainer(user);
        }
    });

    const createButton = (menu, id, text, page) => {
        let item = document.createElement('li');
        menu.appendChild(item);

        item.innerHTML = `<button class="menu-button" id="${id}">${text}</button>`;

        const btn = document.getElementById(`${id}`);

        btn.addEventListener('click', event => {
            auth.logout();
            window.location = page;
            event.preventDefault();
        });
    }

    if (uploadPasta) {
        uploadPasta.addEventListener('submit', event => {
            const URL = document.getElementById('image-URL');
            const name = document.getElementById('image-name');

            if (URL.value && name.value) {
                pasta.post(URL.value, name.value);
                const errors = document.getElementById('errors');
                errors.classList.add('errors-visible');
                errors.innerText = "Uploaded pasta!";
            }
            else {
                const errors = document.getElementById('errors');
                errors.classList.add('errors-visible');
                errors.innerText = "Please fill in both fields!";
            }
            URL.value = '';
            name.value = '';

            event.preventDefault();
        });
    }

    const post = (pastasDB, key) => {
        const data = pastasDB[key];
        if (myPastaContainer) {
            return `<div class="img-container">
                        <a href="${data.imageURL}"><img src="${data.imageURL}" class="pasta-image" /></a>
                    </div>
                    <div class="fav-pasta">
                        <label class="image-name"><span>${data.imageName}</span></label>
                    </div>
                    <div class="delete-pasta">
                        <button class="delete-button" data-id="${key}">Del-Eat Pasta</button>
                    </div>`;
        }
        else {
            return `<div class="img-container">
                        <a href="${data.imageURL}"><img src="${data.imageURL}" class="pasta-image" /></a>
                    </div>                    
                    <div class="fav-pasta">
                        <label class="image-name"><span>${data.imageName}</span></label>
                    </div>`;
        }
    }

    const populateContainer = user => {
        if (pastaContainer) {
            populate();
        }
        else if (myPastaContainer) {
            if (user) {
                populateMyUploads();
            }
            else {
                warning(myPastaContainer, "Please login to see your uploads!");
            }
        }
        else if (favPastaContainer) {
            if (user) {
                populate();
            }
            else {
                warning(favPastaContainer, "Please login to see your favourites!");
            }
        }
    }

    const populate = () => {
        fetch("https://api.npoint.io/636409df8ded0c89c938").then(response => response.json()).then(db => {
            const pastasDB = db.pastas;
            const currentUser = firebase.auth().currentUser;

            hideLoader();
            let emptyFlag = true;
            for (var key in pastasDB) {
                let article = document.createElement('article');
                article.classList.add('pasta');
                article.innerHTML = post(pastasDB, key);

                if (currentUser) {
                    const userId = currentUser.uid;

                    if (!Object.prototype.hasOwnProperty.call(db.users, userId)) {
                        db.users[userId] = {
                            "favourites": {}
                        };
                        database.update(db);
                    }

                    const dbRef = db.users[userId].favourites;
                    createFavButton(article, dbRef, key);
                }

                if (pastaContainer) {
                    pastaContainer.prepend(article);
                    emptyFlag = false;
                }
                else {
                    const userId = currentUser.uid;
                    const dbRef = db.users[userId].favourites;

                    if (Object.prototype.hasOwnProperty.call(dbRef, key)) {
                        favPastaContainer.prepend(article);
                        emptyFlag = false;
                    }
                }
            }

            if (emptyFlag) {
                if (pastaContainer) {
                    warning(pastaContainer, "All the pasta has been eaten!");
                }
                else {
                    warning(favPastaContainer, "You have no favourite pasta!");
                }
            }

        }).catch((err) => {
            console.log(err);
        });
    }

    const populateMyUploads = () => {
        fetch("https://api.npoint.io/636409df8ded0c89c938").then(response => response.json()).then(db => {
            const pastasDB = db.pastas;
            const currentUser = firebase.auth().currentUser;
            hideLoader();
            let emptyFlag = true;
            for (var key in pastasDB) {
                if (pastasDB[key].userId == currentUser.uid) {
                    let article = document.createElement('article');
                    article.classList.add('pasta');
                    article.innerHTML = post(pastasDB, key);
                    myPastaContainer.prepend(article);
                    emptyFlag = false;

                    article.querySelector('.delete-pasta').addEventListener('click', event => {
                        const postId = event.target.getAttribute('data-id');
                        pasta.delete(postId);
                        document.getElementById('my-pastas').removeChild(event.target.parentNode.parentNode);
                        event.preventDefault();
                    })
                }
            }

            if (emptyFlag) {
                warning(myPastaContainer, "You have no uploads!");
            }

        }).catch((err) => {
            console.log(err);
        });
    }

    const createFavButton = (article, dbRef, id) => {
        let btn = document.createElement('button');
        btn.classList.add("fa-heart");
        btn.setAttribute('id', 'fav-button');
        btn.setAttribute('data-id', id);

        favButtonFunctionality(id, btn);

        article.querySelector('.fav-pasta').append(btn);

        if (Object.prototype.hasOwnProperty.call(dbRef, id)) {
            btn.classList.add('fas');
        }
        else {
            btn.classList.add('far');
        }
    }

    const favButtonFunctionality = (id, btn) => {
        btn.addEventListener('click', event => {
            if (btn.classList.contains('far')) {
                pasta.favourite(id);
                btn.classList.remove('far');
                btn.classList.add('fas');
            }
            else {
                pasta.unfavourite(id);
                btn.classList.remove('fas');
                btn.classList.add('far');
            }
            event.preventDefault();
        });
    }

    const warning = (container, string) => {
        hideLoader();
        let label = document.createElement('label');
        label.classList.add('login-warning');
        label.innerHTML = string;
        container.prepend(label);
    }

    const hideLoader = () => {
        document.getElementById("loader").classList.add("hidden");
    }

})(this);

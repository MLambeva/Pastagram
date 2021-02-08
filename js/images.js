"use strict";

(() => {
    const db = firebase.database();
    const pastasDB = db.ref('/pastas');
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

    if (uploadPasta) {
        uploadPasta.addEventListener('submit', event => {
            const URL = document.getElementById('image-URL');
            const name = document.getElementById('image-name');

            if (URL.value && name.value) {
                pasta.post(URL.value, name.value);
            }
            URL.value = '';
            name.value = '';

            event.preventDefault();
        });
    }

    const post = data => {
        const post = data.val();
        if (myPastaContainer) {
            return `<div class="img-container">
                        <a href="${post.imageURL}"><img src="${post.imageURL}" class="pasta-image" /></a>
                    </div>
                    <label class="image-name">${post.imageName}</label>
                    <div class="delete-pasta">
                        <button class="delete-button" data-id="${data.key}">Del-Eat Pasta</button>
                    </div>`;
        }
        else {
            return `<div class="img-container">
                        <a href="${post.imageURL}"><img src="${post.imageURL}" class="pasta-image" /></a>
                    </div>                    
                    <div class="fav-pasta">
                        <label class="image-name">${post.imageName}</label>
                    </div>`;
        }
    }

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

    const populateContainer = user => {
        if (pastaContainer) {
            populateUploads();
        }
        else if (myPastaContainer) {
            if (user) {
                populateMyUploads();
            }
            else {
                pleaseLogin(myPastaContainer, "uploads");
            }
        }
        else if (favPastaContainer) {
            if (user) {
                populateFavourites();
            }
            else {
                pleaseLogin(favPastaContainer, "favourites");
            }
        }
    }

    const populateUploads = () => pastasDB.on('child_added', data => {
        populate(data);
    });

    const populateMyUploads = () => pastasDB.on('child_added', data => {
        hideLoader();

        if (data.val().userId == firebase.auth().currentUser.uid) {
            let article = document.createElement('article');
            article.classList.add('pasta');
            article.innerHTML = post(data);
            myPastaContainer.prepend(article);

            article.querySelector('.delete-pasta').addEventListener('click', event => {
                const postId = event.target.getAttribute('data-id');
                pasta.delete(postId);
                document.getElementById('my-pastas').removeChild(event.target.parentNode.parentNode);
                event.preventDefault();
            })
        }
    });

    const populateFavourites = () => pastasDB.on('child_added', data => {
        populate(data);
    });

    const populate = data => {
        const currentUser = firebase.auth().currentUser;

        hideLoader();
        let article = document.createElement('article');
        article.classList.add('pasta');
        article.innerHTML = post(data);

        if (currentUser) {
            const userId = currentUser.uid;
            const dbRef = db.ref('users/' + userId + '/favourites/');
            createFavButton(article, dbRef, data);
        }

        if (pastaContainer) {
            pastaContainer.prepend(article)
        }
        else {
            const userId = currentUser.uid;
            const dbRef = db.ref('users/' + userId + '/favourites/');
            dbRef && dbRef.once('value').then(snapshot => {
                if (snapshot.hasChild(data.key)) {
                    favPastaContainer.prepend(article);
                }
            });
        }
    }

    const createFavButton = (article, dbRef, data) => {
        let btn = document.createElement('button');
            btn.classList.add("fa-heart");
            btn.setAttribute('id', 'fav-button');
            btn.setAttribute('data-id', data.key);

            favButtonFunctionality(data, btn);

            article.querySelector('.fav-pasta').append(btn);

            dbRef && dbRef.once('value').then(snapshot => {
                if (snapshot.hasChild(data.key)) {
                    btn.classList.add('fas');
                }
                else {
                    btn.classList.add('far');
                }
            });
    }

    const favButtonFunctionality = (data, btn) => {
        btn.addEventListener('click', event => {

            if (btn.classList.contains('far')) {
                pasta.favourite(data.key);
                btn.classList.remove('far');
                btn.classList.add('fas');
            }
            else {
                pasta.unfavourite(data.key);
                btn.classList.remove('fas');
                btn.classList.add('far');
            }
            event.preventDefault();
        });
    }

    const pleaseLogin = (container, string) => {
        hideLoader();
        let label = document.createElement('label');
        label.classList.add('login-warning');
        label.innerHTML = `Please log in to see your ${string}!`;
        container.prepend(label);
    }

    const hideLoader = () => {
        document.getElementById("loader").classList.add("hidden");
    }

})(this);

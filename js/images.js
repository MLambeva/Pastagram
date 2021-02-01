(() => {
    const db = firebase.database();
    const pastasDB = db.ref('/pastas');
    const pastaContainer = document.getElementById('pastas');
    const myPastaContainer = document.getElementById('my-pastas');
    const favPastaContainer = document.getElementById('fav-pastas');
    const newPasta = document.getElementById('upload-form');

    firebase.auth().onAuthStateChanged(function (user) {
        const menu = document.getElementById('menu-buttons');

        if (menu) {
            if (user) {
                let item = document.createElement('li');
                menu.appendChild(item);

                item.innerHTML = `<button class="menu-button" id="logout">Log out</button>`

                const logoutBtn = document.getElementById('logout');

                logoutBtn && logoutBtn.addEventListener('click', event => {
                    auth.logout();
                    window.location = 'login.html';
                    event.preventDefault();
                })
            }
            else {
                let item1 = document.createElement('li');
                let item2 = document.createElement('li');
                menu.appendChild(item1);
                menu.appendChild(item2);
                item1.classList.add('menu-item');
                item2.classList.add('menu-item');

                item1.innerHTML = `<button class="menu-button" id="login">Log in</button>`;
                item2.innerHTML = `<button class="menu-button" id="reg">Register</button>`;

                const loginBtn = document.getElementById('login');

                loginBtn && loginBtn.addEventListener('click', event => {
                    window.location = 'login.html';
                    event.preventDefault();
                })

                const regBtn = document.getElementById('reg');

                regBtn && regBtn.addEventListener('click', event => {
                    window.location = 'register.html';
                    event.preventDefault();
                })
            }

            if (pastaContainer) {
                populateUploads();
            }
            else if (myPastaContainer) {
                if (user) {
                    populateMyUploads();
                }
                else {
                    document.getElementById("loader").classList.add("hidden");
                    let label = document.createElement('label');
                    label.classList.add('login-warning');
                    label.innerHTML = `Please log in to see your uploads!`;
                    myPastaContainer.prepend(label);
                }
            }
            else if (favPastaContainer) {
                if (user) {
                    populateFavourites();
                }
                else {
                    document.getElementById("loader").classList.add("hidden");
                    let label = document.createElement('label');
                    label.classList.add('login-warning');
                    label.innerHTML = `Please log in to see your favourites!`;
                    favPastaContainer.prepend(label);
                }
            }

        }
    });

    const post = data => {
        const state = data.val();

        if (myPastaContainer) {
            return `<div class="img-container">
                        <a href="${state.imageURL}"><img src="${state.imageURL}" /></a>
                    </div>
                    <label>${state.imageName}</label>
                    <div class="delete-pasta">
                        <button class="delete-pasta" data-id="${data.key}">Del-Eat Pasta</button>
                    </div>`;
        }
        else {
            return `<div class="img-container">
                        <a href="${state.imageURL}"><img src="${state.imageURL}" /></a>
                    </div>                    
                    <div class="fav-pasta">
                        <label class="image-name">${state.imageName}</label>
                    </div>`;
        }
    };

    if (newPasta) {
        newPasta.addEventListener('submit', event => {
            const URL = document.getElementById('image-URL');
            const name = document.getElementById('image-name')
            const URLValue = URL.value;
            const nameValue = name.value;

            URL.value = '';
            name.value = '';
            if (URLValue && nameValue) {
                pasta.post(URLValue, nameValue);
            }
            event.preventDefault();
        });
    }

    const populateUploads = () => pastasDB.on('child_added', data => {

        document.getElementById("loader").classList.add("hidden");
        let article = document.createElement('article');
        article.classList.add('pasta');
        article.innerHTML = post(data);

        if (firebase.auth().currentUser) {

            let btn = document.createElement('button');
            btn.classList.add("fa-heart");
            btn.setAttribute('id', 'fav-button');
            btn.setAttribute('data-id', data.key);

            const db = firebase.database();
            const currentUser = firebase.auth().currentUser;
            const userId = currentUser.uid;
            const dbRef = db.ref('users/' + userId + '/favourites/');

            if (dbRef) {
                dbRef.once('value').then(snapshot => {
                    if (snapshot.hasChild(data.key)) {
                        btn.classList.add('fas');
                    }
                    else {
                        btn.classList.add('far');
                    }
                });
            }

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

            article.querySelector('.fav-pasta').append(btn);
        }
        pastaContainer.prepend(article);
    });

    const populateMyUploads = () => pastasDB.on('child_added', data => {
        if (data.val().userId == firebase.auth().currentUser.uid) {
            document.getElementById("loader").classList.add("hidden");
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

        document.getElementById("loader").classList.add("hidden");
        let article = document.createElement('article');
        article.classList.add('pasta');
        article.innerHTML = post(data);


        let btn = document.createElement('button');
        btn.classList.add("fa-heart");
        btn.setAttribute('id', 'fav-button');
        btn.setAttribute('data-id', data.key);

        const db = firebase.database();
        const currentUser = firebase.auth().currentUser;
        const userId = currentUser.uid;
        const dbRef = db.ref('users/' + userId + '/favourites/');

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

        article.querySelector('.fav-pasta').append(btn);

        if (dbRef) {
            dbRef.once('value').then(snapshot => {
                if (snapshot.hasChild(data.key)) {
                    btn.classList.add('fas');
                    favPastaContainer.prepend(article);
                }
            });
        }

    });

})(this);


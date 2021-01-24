(() => {
    const db = firebase.database();
    const pastasDB = db.ref('/pastas');
    const pastaContainer = document.getElementById('pastas');
    const myPastaContainer = document.getElementById('my-pastas');
    const newPasta = document.getElementById('upload-form');

    var user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function (user) {
        let menu = document.getElementById('menu-buttons');

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
                item1.classList.add('button-li');
                item2.classList.add('button-li');

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
                    <label>${state.imageName}</label>`;
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


})(this);


(() => {

    var user = firebase.auth().currentUser;
    firebase.auth().onAuthStateChanged(function (user) {
        let menu = document.getElementById('menu-buttons');

        if (menu) {
            if (user) {
                let item = document.createElement('li');
                menu.appendChild(item);

                let a = document.createElement('button');

                item.appendChild(a);

                a.setAttribute('class', 'menu-button');

                a.setAttribute('id', 'logout');

                let t = document.createTextNode('Log out');

                a.appendChild(t);

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

                let a1 = document.createElement('button');
                let a2 = document.createElement('button');

                item1.appendChild(a1);
                item2.appendChild(a2);

                a1.setAttribute('class', 'menu-button');
                a2.setAttribute('class', 'menu-button');

                a1.setAttribute('id', 'login');
                a2.setAttribute('id', 'reg');

                let t1 = document.createTextNode('Log in');
                let t2 = document.createTextNode('Register');

                a1.appendChild(t1);
                a2.appendChild(t2);

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
        }
    });
})(this);


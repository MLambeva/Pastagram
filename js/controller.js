(() => {
	const registerForm = document.getElementById('register-form');
	const loginForm = document.getElementById('login-form');
	const logoutBtn = document.getElementById('logout');
	const errors = document.getElementById('errors');
	const urlParams = new URLSearchParams(window.location.search);

	if (urlParams.get("error") === "accessDenied") {
		errors.classList.add('errors-visible');
		errors.innerText = "Access denied. Please login.";
	}

	registerForm && registerForm.addEventListener('submit', event => {
		const formData = new FormData(event.target);
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');

		event.preventDefault();

		auth.register(username, email, password, (success, errorCode, errorMessage) => {
			if (success) {
				window.location = 'index.html';
			} else {
				errors.classList.add('errors-visible');
				errors.innerText = errorMessage;
			}
		});
	});

	loginForm && loginForm.addEventListener('submit', event => {
		const formData = new FormData(event.target);
		const email = formData.get('email');
		const password = formData.get('password');

		event.preventDefault();

		auth.login(email, password, (success, errorCode, errorMessage) => {
			if (success) {
				window.location = 'index.html';
			} else {
				errors.classList.add('errors-visible');
				errors.innerText = errorMessage;
			}
		});

	});

	logoutBtn && logoutBtn.addEventListener('click', event => {
		auth.logout();
		event.preventDefault();
	})

    function validateUser() {
		if (!firebase.auth().currentUser) {
			// user is not logged in
			//window.location = 'index.html?error=accessDenied';
			return false;
		}

		return true;
    }
    window.onload = function(){
        if(validateUser()){
            console.log("OK");
        }
        else{
            console.log("NOT OK");
        }
	}
	
	

})(this);


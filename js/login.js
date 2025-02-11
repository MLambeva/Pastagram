"use strict";

(() => {
	const registerForm = document.getElementById('register-form');
	const loginForm = document.getElementById('login-form');
	const errors = document.getElementById('errors');
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("error") === "accessDenied") {
		errors.classList.add('errors-visible');
		errors.innerText = "Access denied. Please login.";
	}

	const callback = (success, errorCode, errorMessage) => {
		if (success) {
			window.location = 'index.html';
		} else {
			errors.classList.add('errors-visible');
			errors.innerText = errorMessage;
		}
	}

	registerForm && registerForm.addEventListener('submit', event => {
		const formData = new FormData(event.target);
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');

		event.preventDefault();

		auth.register(username, email, password, callback);
	});

	loginForm && loginForm.addEventListener('submit', event => {
		const formData = new FormData(event.target);
		const email = formData.get('email');
		const password = formData.get('password');

		event.preventDefault();

		auth.login(email, password, callback);
	});

})(this);

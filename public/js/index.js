/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

const $d = document;
const mapBox = $d.getElementById('map');
const loginForm = $d.querySelector('#login-form');
const logoutBtn = $d.querySelector('.nav__el--logout');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm)
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = $d.getElementById('email').value;
    const password = $d.getElementById('password').value;
    login({ email, password });
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

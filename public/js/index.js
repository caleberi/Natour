/* eslint-disable */
import '@babel/polyfill';
import { login, logout, forgot } from './login';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.getElementById('book-tour');
const forgotForm = document.getElementById('forgot-form');
const reviewBtn = document.querySelector('.reviews__add__review');
const reviewFormContainer = document.querySelector('.review-form');
// const reviewSubmitBtn = document.querySelector('.reviews__add__review');
const reviewForm = document.querySelector('.review_form__form');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm)
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login({ email, password });
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    e.target.textContent = 'Processing';
    const { tourId } = e.target.dataset;
    await bookTour(tourId);
  });
}

if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    await forgot({ email });
  });
}

if (reviewBtn) {
  reviewBtn.addEventListener('click', (e) => {
    reviewBtn.classList.add('remove_review_btn');
    reviewFormContainer.classList.remove('hide_review_form');
  });
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      reviewFormContainer.classList.add('hide_review_form');
      reviewBtn.classList.remove('remove_review_btn');
    });
  }
}

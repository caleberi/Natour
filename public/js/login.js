import axios from 'axios';
import { hideAlert, showAlert } from './alerts';
export async function login({ email, password }) {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully', 1200);
      window.setTimeout(() => {
        location.assign('/overview');
      }, 1500);
    }
  } catch (err) {
    hideAlert('failure', `${err.reponse.data.message}`, 1200);
  }
}

export const logout = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully', 1200);
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    hideAlert('failure', 'Error logging out ! try again ', 1200);
  }
};

export const forgot = async ({ email }) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/forgotPassword',
      data: { email },
    });
    if (res.data.status === 'success') {
      showAlert('success', `Reset Token Sent to ${email} .`, 1200);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    hideAlert('failure', 'Error Sending Token ! please try again ', 1200);
  }
};

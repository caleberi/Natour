import axios from 'axios';
import { hideAlert, showAlert } from './alerts';
export async function login({ email, password }) {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully', 1200);
      window.setTimeout(() => {
        window.location.href = 'http://localhost:3000/overview';
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
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      // location.reload(true);
      showAlert('success', 'Logged out successfully', 1200);
      window.setTimeout(() => {
        window.location.href = 'http://localhost:3000/';
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out ! try again ');
  }
};

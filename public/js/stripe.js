import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51KHoFOLRRKMMK7b9MJ7fzWYzapkohdnZk96shxrCt4H2kAurVN9U7dX97AOgMNdWTYMUya3luLEPeJnmT61SHk7o003pYp3ZYE'
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    await stripe.redirectToCheckout({
      sessionId: session.data.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err, 1200);
  }
};

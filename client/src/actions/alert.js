import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';

export const setAler = (msg, alertType) => dispatch => {
    const id = uuid.v4();
    dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id }
    });
}
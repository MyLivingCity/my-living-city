import axios from 'axios';
import { API_BASE_URL } from '../constants';

export const sendEmail = async (data: any) => {
  // Parse data and data checking
  const res = await axios({
    method: 'post',
    url: `${API_BASE_URL}/sendEmail`,
    data: data,
})
  return res.data;
}
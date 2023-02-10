import axios from 'axios';
import { useQuery } from 'react-query';
import { API_BASE_URL } from '../lib/constants';
import { IFetchError } from '../lib/types/types';
import { IQuarantineNotification } from '../lib/types/data/quarantinePostNotification.type';

export const getQuarantinePostNotifications = async () => {
  const res = await axios.get(`${API_BASE_URL}/dashboard/getAllNotifications`);
  return res.data;
}

export const useQuarantinePostNotifications = () => {
  return useQuery<IQuarantineNotification[], IFetchError>(
    'quarantinePostNotifications',
    getQuarantinePostNotifications,
  );
}

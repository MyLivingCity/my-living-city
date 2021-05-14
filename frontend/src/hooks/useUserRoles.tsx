import axios from 'axios';
import { useQuery } from 'react-query';
import { API_BASE_URL } from '../lib/constants';
import { IUserRole } from '../lib/types/data/userRole.type';
import { IFetchError } from '../lib/types/types';

export const getAllUserRoles = async () => {
  const res = await axios.get<IUserRole[]>(`${API_BASE_URL}/role/getall`);
  return res.data;
}

const useUserRoles = () => {
  return useQuery<IUserRole[], IFetchError>(
    'userRoles', 
    getAllUserRoles,
  );
}

export default useUserRoles;
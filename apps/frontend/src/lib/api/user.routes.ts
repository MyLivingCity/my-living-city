import axios from "axios";
import { API_BASE_URL } from "../constants";
import {
  type IRegisterInput,
  type SegmentRequest,
} from "../../components/content/session/types/register.types";

export const getUserWithEmail = async (
  email: string | undefined,
): Promise<number> => {
  const res = await axios.get(`${API_BASE_URL}/user/email/${email}`);
  return res.status;
};

export const postRegisterUser = async (
  registerData: IRegisterInput,
  requestData: SegmentRequest[] | null,
  logUser: boolean | null,
  avatar: File | undefined,
): Promise<void> => {
  const { email, password, confirmPassword } = registerData;

  if (!email || !password) throw new Error("Email and password are required.");
  if (password !== confirmPassword) throw new Error("Passwords must match.");

  registerData.verified = !logUser;

  const res = await axios.post(`${API_BASE_URL}/user/signup`, {
    ...registerData,
    userSegment: {
      homeSegmentId: registerData.homeSegmentId,
      workSegmentId: registerData.workSegmentId,
      schoolSegmentId: registerData.schoolSegmentId,
      homeSubSegmentId: registerData.homeSubSegmentId,
      workSubSegmentId: registerData.workSubSegmentId,
      schoolSubSegmentId: registerData.schoolSubSegmentId,
    },
    segmentRequest: requestData,
    userReach: registerData.reachSegmentIds,
  });

  if (res.status !== 201) throw new Error("Failed to create user.");
  if (avatar) await postAvatarImage(avatar, res.data.token);
  if (logUser) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }
};

const postAvatarImage = async (avatar: File, token: string): Promise<void> => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  await axios.post(`${API_BASE_URL}/user/avatar`, formData, {
    headers: { "x-auth-token": token },
  });
};

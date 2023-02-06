import { useContext } from 'react'
import { Button, Container, Form, Modal, Row } from 'react-bootstrap';
import { IUser } from 'src/lib/types/data/user.type';
import { UserProfileContext } from 'src/contexts/UserProfile.Context';
import { FindBanDetailsWithStaleTime } from 'src/hooks/banHooks';

interface BanHistoryModalProps {
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show: boolean;
    modalUser: IUser;
    currentUser: IUser;
    token: string | null
};

export const BanMessageModal = ({
    setShow,
    show,
    modalUser,
    currentUser,
    token
}: BanHistoryModalProps) => {
    const { data, error, isLoading, isError } = FindBanDetailsWithStaleTime(modalUser.id);
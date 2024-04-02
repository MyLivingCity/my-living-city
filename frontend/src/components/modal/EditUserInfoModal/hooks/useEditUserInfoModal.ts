import { useState, useEffect } from 'react';
import { EditUserInfoModalProps } from '..';
import { IUser } from 'src/lib/types/data/user.type';
import { getAllSubSegmentsWithId } from 'src/lib/api/segmentRoutes';
import { updateUser } from 'src/lib/api/userRoutes';
import { getMyUserSegmentInfo, updateUserSegmentInfo } from 'src/lib/api/userSegmentRoutes';
import { USER_TYPES } from 'src/lib/constants';
import { getCommentsOfUser } from 'src/lib/api/commentRoutes';
import { IComment } from 'src/lib/types/data/comment.type';
import { getUserIdeas } from 'src/lib/api/ideaRoutes';


interface SelectOption {
    value: string;
    label: string;
}

const userTypes = Object.keys(USER_TYPES);

const CommentsAndPostsPageInfo = (modalUser: IUser, token: string | null) => {
    const [comments, setComments] = useState<IComment[]>([]);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [loadingPosts, setLoadingPosts] = useState<boolean>(false);

    useEffect(() => {
        // getComments and getPosts
        setLoadingComments(true);
        getCommentsOfUser(modalUser.id, token).then((data) => {
            console.log('comments', data);
            setComments(data);
            setLoadingComments(false);
        });

        setLoadingPosts(true);
        getUserIdeas(modalUser.id).then((data) => {
            console.log('posts', data);
            setPosts(data);
            setLoadingPosts(false);
        });
    }, [modalUser.id, token]);

    return {
        comments,
        loadingComments,
        posts,
        loadingPosts
    };
};

export const useEditUserInfoModal = ({
    setShow,
    show,
    currentUser,
    token,
    modalUser,
    segs,
    subSeg,
    changesSaved,
    editSegmentsOnly = false,
    editSegmentOnlySegment,
}: EditUserInfoModalProps) => {
    const [userType, setUserType] = useState(modalUser?.userType as string);
    const [firstName, setFirstName] = useState(modalUser?.fname);
    const [lastName, setLastName] = useState(modalUser?.lname);
    const [organizationName, setOrganizationName] = useState(modalUser?.organizationName);

    const [superSegOptions, setSuperSegOptions] = useState<SelectOption[]>([]);
    const [orginalSegmentInfo, setOrginalSegmentInfo] = useState<IUser['userSegments']>();

    // These Options need to update based on the selected Super Segment
    const [homeSegOptions, setHomeSegOptions] = useState<SelectOption[]>([]);
    const [workSegOptions, setWorkSegOptions] = useState<SelectOption[]>([]);
    const [schoolSegOptions, setSchoolSegOptions] = useState<SelectOption[]>([]);

    // These Options need to update based on the selected Segment
    const [homeSubSegOptions, setHomeSubSegOptions] = useState<SelectOption[]>([]);
    const [workSubSegOptions, setWorkSubSegOptions] = useState<SelectOption[]>([]);
    const [schoolSubSegOptions, setSchoolSubSegOptions] = useState<SelectOption[]>([]);

    const { comments, loadingComments, posts, loadingPosts } = CommentsAndPostsPageInfo(modalUser, token);

    // When Super Segment is changed, the Segment Options need to update
    const handleSuperSegmentChange = (
        option: string,
        SetSuperSegment: (value: React.SetStateAction<string>) => void,
        SetSegment: (value: React.SetStateAction<string>) => void,
        SetSegmentOptions: (value: React.SetStateAction<SelectOption[]>) => void,
        SetSubSegment: (value: React.SetStateAction<string>) => void,
        SetSubSegmentOptions: (value: React.SetStateAction<SelectOption[]>) => void,
        clearSegment?: boolean,
    ) => {
        SetSuperSegment(option);
        if (subSeg && option !== '') {
            const newSegmentOptions = subSeg
                .filter((seg) => seg.superSegId === parseInt(option))
                .map((seg) => ({ label: seg.name, value: seg.segId.toString() }));
            SetSegmentOptions(newSegmentOptions);
        } else {
            SetSegmentOptions([]);
        }
        if (clearSegment) {
            SetSegment('');
            SetSubSegment('');
            SetSubSegmentOptions([]);
        }
    };

    // When Segment is changed, the Sub Segment Options need to update
    const handleSegmentChange = (
        sectionOption: string,
        SetSegment: (value: React.SetStateAction<string>) => void,
        SetSubSegment: (value: React.SetStateAction<string>) => void,
        SetSubSegmentOptions: (value: React.SetStateAction<SelectOption[]>) => void,
        clearSubSeg?: boolean
    ) => {
        SetSegment(sectionOption);
        if (sectionOption && sectionOption !== '') {
            getAllSubSegmentsWithId(sectionOption).then((data) => {
                const subSegOptions = data.map((subSeg) => ({ value: subSeg.id.toString(), label: subSeg.name }));
                SetSubSegmentOptions(subSegOptions);
            });
        } else { SetSubSegmentOptions([]); }
        if (clearSubSeg) { SetSubSegment(''); }
    };

    // All User Types should have a Home Segment
    const [selectedHomeSuperSegment, setSelectedHomeSuperSegment] = useState<string>('');
    const [selectedHomeSegment, setSelectedHomeSegment] = useState<string>('');
    const [selectedHomeSubSegment, setSelectedHomeSubSegment] = useState<string>('');
    const handleHomeSuperSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSuperSegmentChange(event.target.value, setSelectedHomeSuperSegment, setSelectedHomeSegment, setHomeSegOptions, setSelectedHomeSubSegment, setHomeSubSegOptions, true);
    };
    const handleHomeSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSegmentChange(event.target.value, setSelectedHomeSegment, setSelectedHomeSubSegment, setHomeSubSegOptions, true);
    };
    const handleHomeSubSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedHomeSubSegment(event.target.value);
    };
    const handleClearHomeInfo = () => {
        setSelectedHomeSuperSegment('');
        setSelectedHomeSegment('');
        setSelectedHomeSubSegment('');
        setHomeSegOptions([]);
        setHomeSubSegOptions([]);
    };

    // Work segment is only for RESIDENTIAL users
    const [selectedWorkSuperSegment, setSelectedWorkSuperSegment] = useState<string>('');
    const [selectedWorkSegment, setSelectedWorkSegment] = useState<string>('');
    const [selectedWorkSubSegment, setSelectedWorkSubSegment] = useState<string>('');

    const handleWorkSuperSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSuperSegmentChange(event.target.value, setSelectedWorkSuperSegment, setSelectedWorkSegment, setWorkSegOptions, setSelectedWorkSubSegment, setWorkSubSegOptions, true);
    };
    const handleWorkSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSegmentChange(event.target.value, setSelectedWorkSegment, setSelectedWorkSubSegment, setWorkSubSegOptions, true);
    };
    const handleWorkSubSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWorkSubSegment(event.target.value);
    };
    const handleClearWorkInfo = () => {
        setSelectedWorkSuperSegment('');
        setSelectedWorkSegment('');
        setSelectedWorkSubSegment('');
        setWorkSegOptions([]);
        setWorkSubSegOptions([]);
    };

    // School segment is only for RESIDENTIAL users
    const [selectedSchoolSuperSegment, setSelectedSchoolSuperSegment] = useState<string>('');
    const [selectedSchoolSegment, setSelectedSchoolSegment] = useState<string>('');
    const [selectedSchoolSubSegment, setSelectedSchoolSubSegment] = useState<string>('');

    const handleSchoolSuperSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSuperSegmentChange(event.target.value, setSelectedSchoolSuperSegment, setSelectedSchoolSegment, setSchoolSegOptions, setSelectedSchoolSubSegment, setSchoolSubSegOptions, true);
    };
    const handleSchoolSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        handleSegmentChange(event.target.value, setSelectedSchoolSegment, setSelectedSchoolSubSegment, setSchoolSubSegOptions, true);
    };
    const handleSchoolSubSegmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSchoolSubSegment(event.target.value);
    };
    const handleClearSchoolInfo = () => {
        setSelectedSchoolSuperSegment('');
        setSelectedSchoolSegment('');
        setSelectedSchoolSubSegment('');
        setSchoolSegOptions([]);
        setSchoolSubSegOptions([]);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const updatedUserData: IUser = {
            ...modalUser,
            userType: userType as USER_TYPES,
            fname: firstName,
            lname: lastName,
            displayFName: firstName,
            displayLName: lastName,
            organizationName,
            ...orginalSegmentInfo && {
                userSegments: {
                    ...orginalSegmentInfo,
                    userId: modalUser?.id || '',
                    homeSuperSegId: parseInt(selectedHomeSuperSegment),
                    homeSegmentId: parseInt(selectedHomeSegment),
                    homeSubSegmentId: parseInt(selectedHomeSubSegment),
                    workSuperSegId: parseInt(selectedWorkSuperSegment),
                    workSegmentId: parseInt(selectedWorkSegment),
                    workSubSegmentId: parseInt(selectedWorkSubSegment),
                    schoolSuperSegId: parseInt(selectedSchoolSuperSegment),
                    schoolSegmentId: parseInt(selectedSchoolSegment),
                    schoolSubSegmentId: parseInt(selectedSchoolSubSegment),
                }
            },
        };
        try {
            if (updatedUserData.userSegments) {
                const [updateUserResult, updateSegmentResult] = await Promise.all([
                    updateUser(updatedUserData, token, currentUser),
                    updateUserSegmentInfo(updatedUserData.userSegments, token)
                ]);
                // To update the user in the parent component
                changesSaved && changesSaved(updateUserResult.user);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const [selectedReachSegIds, setSelectedReachSegIds] = useState<any[]>([]);

    const toggleAllReachSegIds = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedReachSegIds(homeSegOptions.map((seg) => seg.value));
        } else {
            setSelectedReachSegIds([]);
        }
    };

    const handleReachSegChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isCheckboxChecked = event.target.checked;
        let selectedCopy = [...selectedReachSegIds];
        if (isCheckboxChecked) { // Checked
            selectedCopy = [...selectedCopy, event.target.value];
        } else { // Unchecked
            const index = selectedCopy.indexOf(event.target.value);
            if (index !== -1) selectedCopy.splice(index, 1);
        }
        setSelectedReachSegIds(selectedCopy);
    };

    // Get the Segment data for the selected user
    useEffect(() => {
        getMyUserSegmentInfo(token, modalUser?.id)
            .then((data: any) => {
                const segInfo = data;
                setOrginalSegmentInfo(segInfo);

                handleSuperSegmentChange(segInfo?.homeSuperSegId?.toString() || '', setSelectedHomeSuperSegment, setSelectedHomeSegment, setHomeSegOptions, setSelectedHomeSubSegment, setHomeSubSegOptions);
                handleSegmentChange(segInfo?.homeSegmentId?.toString() || '', setSelectedHomeSegment, setSelectedHomeSubSegment, setHomeSubSegOptions);
                setSelectedHomeSubSegment(segInfo.homeSubSegmentId ? segInfo.homeSubSegmentId.toString() : '');

                handleSuperSegmentChange(segInfo.workSuperSegId?.toString() || '', setSelectedWorkSuperSegment, setSelectedWorkSegment, setWorkSegOptions, setSelectedWorkSubSegment, setWorkSubSegOptions);
                handleSegmentChange(segInfo.workSegmentId?.toString() || '', setSelectedWorkSegment, setSelectedWorkSubSegment, setWorkSubSegOptions);
                setSelectedWorkSubSegment(segInfo.workSubSegmentId ? segInfo.workSubSegmentId.toString() : '');

                handleSuperSegmentChange(segInfo.schoolSuperSegId?.toString() || '', setSelectedSchoolSuperSegment, setSelectedSchoolSegment, setSchoolSegOptions, setSelectedSchoolSubSegment, setSchoolSubSegOptions);
                handleSegmentChange(segInfo.schoolSegmentId?.toString() || '', setSelectedSchoolSegment, setSelectedSchoolSubSegment, setSchoolSubSegOptions);
                setSelectedSchoolSubSegment(segInfo.schoolSubSegmentId ? segInfo.schoolSubSegmentId.toString() : '');

            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalUser?.id]);

    // Create the Super Segment Options
    useEffect(() => {
        if (segs) {
            setSuperSegOptions(segs.map((seg) => ({ value: seg.superSegId.toString(), label: seg.name })));
        }
    }, [segs]);

    return {
        show,
        setShow,
        userType,
        setUserType,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        organizationName,
        setOrganizationName,
        userTypes,
        superSegOptions,
        homeSegOptions,
        workSegOptions,
        schoolSegOptions,
        homeSubSegOptions,
        workSubSegOptions,
        schoolSubSegOptions,
        selectedHomeSuperSegment,
        selectedHomeSegment,
        selectedHomeSubSegment,
        handleHomeSuperSegmentChange,
        handleHomeSegmentChange,
        handleHomeSubSegmentChange,
        handleClearHomeInfo,
        selectedWorkSuperSegment,
        selectedWorkSegment,
        selectedWorkSubSegment,
        handleWorkSuperSegmentChange,
        handleWorkSegmentChange,
        handleWorkSubSegmentChange,
        handleClearWorkInfo,
        selectedSchoolSuperSegment,
        selectedSchoolSegment,
        selectedSchoolSubSegment,
        handleSchoolSuperSegmentChange,
        handleSchoolSegmentChange,
        handleSchoolSubSegmentChange,
        handleClearSchoolInfo,
        handleSubmit,
        selectedReachSegIds,
        toggleAllReachSegIds,
        handleReachSegChange,
        editSegmentsOnly,
        editSegmentOnlySegment,
        comments,
        loadingComments,
        posts,
        loadingPosts
    };
};
import axios from 'axios';
import { API_BASE_URL } from '../constants';
import {
    IGetAllIdeasWithSort,
    getAllIdeasWithSortDefault,
    IIdeaOrderByAggregate,
} from '../types/args/getAllIdeas.args';
import {
    IIdeaWithAggregations,
    IIdeaWithRelationship,
} from '../types/data/idea.type';
import { ICreateIdeaInput } from '../types/input/createIdea.input';
import { getAxiosJwtRequestOption } from './axiosRequestOptions';

export const postCreateCollabotator = async (
    proposalId: number,
    collaboratorData: any,
    banned: boolean,
    token: string | null
) => {
    const { experience, role, time, contactInfo } = collaboratorData;

    if (!experience || !role || !time || !contactInfo) {
        throw new Error('Please fill out all fields');
    }

    if (!token) {
        throw new Error('Your session has expired. Please relogin and try again.');
    }

    let formBody = {
        proposalId: proposalId.toString(),
        experience: experience.toString(),
        role: role.toString(),
        time: time.toString(),
        contactInfo: contactInfo.toString(),
    };



    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/community/create/collaborator`,
        data: formBody,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });

    if (!(res.status == 201 || res.status == 200)) {
        throw new Error(res.data);
    }
    //return response data
    return res.data;
};

export const postCreateVolunteer = async (
    proposalId: number,
    volunteerData: any,
    banned: boolean,
    token: string | null
) => {
    const { experience, task, time, contactInfo } = volunteerData;

    if (!experience || !task || !time || !contactInfo) {
        throw new Error('Please fill out all fields');
    }

    if (!token) {
        throw new Error('Your session has expired. Please relogin and try again.');
    }

    let formBody = {
        proposalId: proposalId.toString(),
        experience: experience.toString(),
        task: task.toString(),
        time: time.toString(),
        contactInfo: contactInfo.toString(),
    };

 

    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/community/create/volunteer`,
        data: formBody,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });

    if (!(res.status == 201 || res.status == 200)) {
        throw new Error(res.data);
    }
    //return response data
    return res.data;
};

export const postCreateDonor = async (
    proposalId: number,
    donorData: any,
    banned: boolean,
    token: string | null
) => {
    const { donations, contactInfo } = donorData;

    if (!donations || !contactInfo) {
        throw new Error('Please fill out all fields');
    }

    if (!token) {
        throw new Error('Your session has expired. Please relogin and try again.');
    }

    let formBody = {
        proposalId: proposalId.toString(),
        donations: donations.toString(),
        contactInfo: contactInfo.toString(),
    };

 

    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/community/create/donor`,
        data: formBody,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });

    if (!(res.status == 201 || res.status == 200)) {
        throw new Error(res.data);
    }
    //return response data
    return res.data;
};

export const getAllCollaboratorsUnderAProposal = async (proposalId: number) => {
    const res = await axios.get(
        `${API_BASE_URL}/community/collaborators/getAll/${proposalId}`
    );
    return res.data;
};

export const getAllDonorsUnderAProposal = async (proposalId: number) => {
    const res = await axios.get(
        `${API_BASE_URL}/community/donors/getAll/${proposalId}`
    );
    return res.data;
};

export const getAllVolunteersUnderAProposal = async (proposalId: number) => {
    const res = await axios.get(
        `${API_BASE_URL}/community/volunteers/getAll/${proposalId}`
    );
    return res.data;
};

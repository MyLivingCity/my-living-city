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
import {IProposalWithAggregations} from '../types/data/proposal.type';

export const getDirectProposal = async () => {
    const res = await axios.get(`${API_BASE_URL}/proposal/`);
    return res.data;
};

export const getAllProposals = async () => {
    const res = await axios.get<IProposalWithAggregations[]>(`${API_BASE_URL}/proposal/getall`);
    return res.data;
};

export const postAllProposalsWithBreakdown = async (take?: number) => {
    let reqBody = {};
    if (!!take) {
        reqBody = {
            take,
        };
    }
    const res = await axios.post(
        `${API_BASE_URL}/proposal/getall/aggregations`,
        reqBody
    );
    return res.data;
};

export const getSingleProposal = async (proposalId: string) => {
    const res = await axios.get(`${API_BASE_URL}/proposal/get/${proposalId}`);
    return res.data;
};

export const getSingleProposalByIdeaId = async (ideaId: string) => {
    const res = await axios.get(`${API_BASE_URL}/proposal/getByIdeaId/${ideaId}`);
    return res.data;
};

export const postCreateProposal = async (
    proposal: any,
    banned: boolean,
    token: string | null
) => {
    const {
        ideaId,
        needCollaborators,
        needVolunteers,
        needDonations,
        needFeedback,
        needSuggestions,
        location,
        feedback,
        feedbackRatingType
    } = proposal;

    let formBody = {
        ideaId: ideaId.toString(),
        needCollaborators: needCollaborators.toString(),
        needVolunteers: needVolunteers.toString(),
        needDonations: needDonations.toString(),
        needFeedback: needFeedback.toString(),
        needSuggestions: needSuggestions.toString(),
        location: location.toString(),
        feedback1: feedback[0].toString(),
        feedback2: feedback[1].toString(),
        feedback3: feedback[2].toString(),
        feedback4: feedback[3].toString(),
        feedback5: feedback[4].toString(),
        feedbackType1: feedbackRatingType[0].toString(),
        feedbackType2: feedbackRatingType[1].toString(),
        feedbackType3: feedbackRatingType[2].toString(),
        feedbackType4: feedbackRatingType[3].toString(),
        feedbackType5: feedbackRatingType[4].toString(),

    };



    const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/proposal/create`,
        data: formBody,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Access-Control-Allow-Origin': '*',
        },
        withCredentials: true,
    });

    //if not success, throw error which will stop form reset
    if (!(res.status == 201 || res.status == 200)) {
        throw new Error(res.data);
    }
    //return response data
    return res.data;

};

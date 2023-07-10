import { Container, Table, Card, Button } from "react-bootstrap";
import { IIdeaWithAggregations } from "../../../lib/types/data/idea.type";
import { BsFilter } from "react-icons/bs";
import CSS from "csstype";
import React, { useState, useEffect, useContext } from "react";
import { useAllProposals } from "src/hooks/proposalHooks";
import { capitalizeFirstLetterEachWord } from "./../../../lib/utilityFunctions";
import { BsPeople, BsHeartHalf } from "react-icons/bs";
import { AiOutlineStar } from "react-icons/ai";
import { getAllSuperSegments } from "./../../../lib/api/segmentRoutes";
import { ISuperSegment } from "./../../../lib/types/data/segment.type";
import { useAllCommentsUnderMultipleIdeas } from "src/hooks/commentHooks";
import { useGetEndorsedMunicpalUsersByIdea } from "src/hooks/ideaHooks";
import { UserProfileContext } from "src/contexts/UserProfile.Context";



interface SpecifiedMunicipalSectionTableViewProps {
    sectionTitle: string;
    topIdeas: IIdeaWithAggregations[];
    postType?: string;
    isDashboard?: boolean;
    showCustomFilter?: boolean;
}



const SpecifiedMunicipalSectionTableView: React.FC<SpecifiedMunicipalSectionTableViewProps> = ({
    sectionTitle,
    topIdeas,
    isDashboard,
    showCustomFilter,
}) => {

    const [showModal, setShowModal] = useState<boolean>(false);
    const [filterConfig, setFilterConfig] = useState<any>({
        category: [],
        impactArea: [],
        superSeg: [],
        seg: [],
        status: [],
    });

   
   




    const { data: allProposals } = useAllProposals();





    const doesIdeaPassFilter = (idea: IIdeaWithAggregations): boolean => {
        if (filterConfig.category.length !== 0 && !filterConfig.category.includes(idea.categoryId)) {
            return false;
        }
        if (filterConfig.impactArea.length !== 0) {
            let doesIdeaPassImpact = true;
            filterConfig.impactArea.forEach((impactArea: string) => {
                if (!idea[impactArea as keyof IIdeaWithAggregations]) {
                    doesIdeaPassImpact = false;
                }
            });
            if (!doesIdeaPassImpact) { return false };
        }
        if (filterConfig.superSeg.length !== 0 && !filterConfig.superSeg.includes(idea.superSegId)) {
            return false;
        }
        if (filterConfig.seg.length !== 0 && !filterConfig.seg.includes(idea.segId)) {
            return false;
        }
        if (filterConfig.status.length !== 0 && !filterConfig.status.includes(capitalizeFirstLetterEachWord(idea.state))) {
            return false;
        }
        if (!idea.active) {
            return false;
        }
        return true;
    }

    const titleStyle: CSS.Properties = {
        display: "inline",
    }

    const filterButtonStyle: CSS.Properties = {
        float: "right"
    }

    const mouseHoverPointer = (e: any) => {
        e.target.style.cursor = "pointer"
    }





    const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
    useEffect(() => {
        const fetchSuperSegments = async () => {
            try {
                const fetchedSuperSegments = await getAllSuperSegments();
                setSuperSegments(fetchedSuperSegments);
            } catch (error) {
                console.error(error);
                // handle error appropriately
            }
        };

        fetchSuperSegments();
    }, []);


    const {user, token} = useContext(UserProfileContext);

    const { data: allComments, isLoading, error } = useAllCommentsUnderMultipleIdeas(topIdeas.map(idea => ({ ideaId: idea.id })))


    const { data: allEndorsedPosts, isLoading: allEndorsedPostsLoading } = useGetEndorsedMunicpalUsersByIdea(token, topIdeas.map(idea => ({ ideaId: idea.id })))

    
   


    let checkmarks: boolean[] = [];

    if (allComments && topIdeas) {
        topIdeas.forEach((idea, index) => {
            const municipalCommentExists = allComments[index].some(
                (comment) => comment.ideaId === idea.id && (comment.author.userType === "MUNICIPAL" || comment.author.userType === "MUNICIPAL_SEG_ADMIN")
            );
            checkmarks[index] = municipalCommentExists;
        });
    }

    let checkmarksEndorsed: boolean[] = [];

    if (allEndorsedPosts && topIdeas) {
        topIdeas.forEach((idea, index) => {
          const municipalEndorsementExists = allEndorsedPosts[index].some(
            (endorsed: any) =>  endorsed.userType === "MUNICIPAL"
          );
          checkmarksEndorsed[index] = municipalEndorsementExists;
        });
      }

    return (
        <Container className="system" id="hanging-icons">
            <div className="pb-1 border-bottom display-6 text-left">
                <h2 style={titleStyle}>{sectionTitle ? capitalizeFirstLetterEachWord(sectionTitle) : ""} Posts</h2>
                {showCustomFilter === false ? null : <BsFilter onMouseOver={mouseHoverPointer} style={filterButtonStyle} onClick={() => { setShowModal(!showModal) }} size={30} />}

            </div>
            <div className="p-2 m-2"> {/*padding on the x-axis (left and right) */}
                <div className="dropdown-divider"></div>
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th className="text-center align-middle">#</th>
                        <th className="text-left align-middle">Title</th>
                        <th className="text-center align-middle">Location</th>
                        <th className="text-center align-middle">State</th>
                        <th className="text-left align-middle">Description</th>
                        <th className="text-center align-middle"><AiOutlineStar /></th>
                        <th className="text-center align-middle" >  <BsHeartHalf /></th>
                        <th className="text-center align-middle">  <BsPeople /></th>
                        <th className="col-2 text-center align-middle">Municipal 💬</th>
                        <th className="text-center align-middle">Endorsed</th>
                        <th className="text-center align-middle">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {topIdeas && allProposals
                        ? topIdeas.map((idea, index) => {
                            const superSegmentName = superSegments.find(superSegment => superSegment.superSegId === idea.superSegId)?.name || '';

                            return doesIdeaPassFilter(idea) ?
                                <tr key={idea.id}>

                                    <td className="text-center align-middle">{index + 1}</td>
                                    <td className="align-middle">{idea.title}</td>
                                    <td className="text-left align-middle">
                                        {idea.subSegmentName
                                            ? idea.subSegmentName.charAt(0).toUpperCase() + idea.subSegmentName.slice(1)
                                            : idea.segmentName
                                                ? idea.segmentName.charAt(0).toUpperCase() + idea.segmentName.slice(1)
                                                : superSegmentName}
                                    </td>

                                    <td className="text-center align-middle">{idea.state}</td>
                                    <td className="text-lef align-middle">{idea.description.length > 75 ? `${idea.description.substring(0, 30)}...` : idea.description}</td>
                                    <td className="text-center align-middle">{parseFloat((idea.ratingAvg).toString()).toFixed(2)}</td>
                                    <td className="text-center align-middle">{idea.posRatings}/{idea.negRatings}</td>
                                    <td className="text-center align-middle">
                                        {Number(idea.commentCount) + Number(idea.ratingCount)}
                                    </td>
                                    <td className="text-center align-middle">
                                        {checkmarks[index]
                                            ? <span className="text-success">✔️</span>
                                            : <span className="text-danger">{String.fromCharCode(10060)}</span>}
                                    </td>
                                    <td className="text-center align-middle">
                                        {checkmarksEndorsed[index]
                                            ? <span className="text-success">✔️</span>
                                            : <span className="text-danger">{String.fromCharCode(10060)}</span>}
                                    </td>
                                    <td className="text-center align-middle">  <Card.Link href={`/ideas/${idea.id}`}>
                                        <Button variant="primary">Info</Button>
                                    </Card.Link></td>
                                </tr>
                                : null;
                        })
                        : <tr><td>Loading...</td></tr>
                    }
                </tbody>
            </Table>








        </Container>
    );
};

export default SpecifiedMunicipalSectionTableView;

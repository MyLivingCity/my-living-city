import { Container,  Col, Carousel, Modal, Collapse} from 'react-bootstrap';
import PlaceholderIdeaTile from 'src/components/tiles/PlaceholderIdeaTile';
import { IIdeaWithAggregations } from '../../../lib/types/data/idea.type';
import IdeaTile from '../../tiles/IdeaTile';
import {BsFilter} from 'react-icons/bs';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import CSS from 'csstype';
import React, { useState } from 'react';
import { useCategories} from 'src/hooks/categoryHooks';
import {useAllProposals} from 'src/hooks/proposalHooks';
import { capitalizeFirstLetterEachWord } from './../../../lib/utilityFunctions';
import { useAllSuperSegments, useAllSegments } from './../../../hooks/segmentHooks';
import ProposalTile from '../../tiles/ProposalTile';


interface SpecifiedCommunityProps {
  sectionTitle: string;
  topIdeas: IIdeaWithAggregations[];
  postType?: string;
  isDashboard?: boolean;
  showCustomFilter?: boolean;
}

const SpecifiedCommunitySection: React.FC<SpecifiedCommunityProps> = ({
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

    let topIdeasPages;
    if(topIdeas) {
        topIdeasPages = Math.ceil(topIdeas!.length / 6);
    }
  
    const [isCategoriesOpen, setCategoriesOpen] = useState<boolean>(true);
    const [isImpactOpen, setImpactOpen] = useState<boolean>(false);
    const [isSuperSegOpen, setSuperSegOpen] = useState<boolean>(false);
    const [isSegOpen, setSegOpen] = useState<boolean>(false);
    const [isPostStatusOpen, setPostStatusOpen] = useState<boolean>(false);

    const handleModalCancel = () => {setShowModal(false);};
    const { data: categories, isLoading, error, isError } = useCategories();
    const { data: allSegments } = useAllSegments();
    const { data: allSuperSegments } = useAllSuperSegments();
    const { data: allProposals } = useAllProposals();
    const postStatuses = ['IDEA', 'PROPOSAL', 'PROJECT'];

    const handleCategory = (e: any, value: any) => {
        let configCopy = filterConfig;
        if (e.target.checked) {
            if (!configCopy.category.includes(value)) {configCopy.category = [...configCopy.category, value];}
        } else {
            if (configCopy.category.includes(value)) {
                const indexOfValue = configCopy.category.indexOf(value);
                if (indexOfValue > -1) {configCopy.category.splice(indexOfValue, 1);}
            }
        }
        setFilterConfig(configCopy);
    };

    const handleImpactArea = (e: any, value: any) => {
        let configCopy = filterConfig;
        if (e.target.checked) {
            if (!configCopy.impactArea.includes(value)) {configCopy.impactArea = [...configCopy.impactArea, value];}
        } else {
            if (configCopy.impactArea.includes(value)) {
                const indexOfValue = configCopy.impactArea.indexOf(value);
                if (indexOfValue > -1) {configCopy.impactArea.splice(indexOfValue, 1);}
            }
        }
        setFilterConfig(configCopy);
    };

    const handleSuperSeg = (e: any, value: any) => {
        let configCopy = filterConfig;
        if (e.target.checked) {
            if (!configCopy.superSeg.includes(value)) {configCopy.superSeg = [...configCopy.superSeg, value];}
        } else {
            if (configCopy.superSeg.includes(value)) {
                const indexOfValue = configCopy.superSeg.indexOf(value);
                if (indexOfValue > -1) {configCopy.superSeg.splice(indexOfValue, 1);}
            }
        }
        setFilterConfig(configCopy);
    };

    const handleSeg = (e: any, value: any) => {
        let configCopy = filterConfig;
        if (e.target.checked) {
            if (!configCopy.seg.includes(value)) {configCopy.seg = [...configCopy.seg, value];}
        } else {
            if (configCopy.seg.includes(value)) {
                const indexOfValue = configCopy.seg.indexOf(value);
                if (indexOfValue > -1) {configCopy.seg.splice(indexOfValue, 1);}
            }
        }
        setFilterConfig(configCopy);
    };

    const handlePostStatus = (e: any, value: any) => {
        let configCopy = filterConfig;
        if (e.target.checked) {
            if (!configCopy.status.includes(value)) {configCopy.status = [...configCopy.status, value];}
        } else {
            if (configCopy.status.includes(value)) {
                const indexOfValue = configCopy.status.indexOf(value);
                if (indexOfValue > -1) {configCopy.status.splice(indexOfValue, 1);}
            }
        }
        setFilterConfig(configCopy);
    };

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
            if (!doesIdeaPassImpact) {return false;};
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
        if(!idea.active){
            return false;
        }
        return true;
    };

    const titleStyle: CSS.Properties = {
        display: 'inline',
    };

    const filterButtonStyle: CSS.Properties = {
        float: 'right'
    };

    const mouseHoverPointer = (e: any) => {
        e.target.style.cursor = 'pointer';
    };

    const modalSectionTitle: CSS.Properties = {
        display: 'inline',
    };

    const modalSectionIcon: CSS.Properties = {
        float: 'right',
    };

    return (
        <Container className='system' id='hanging-icons'>
            <style>
                {`
        .carousel-control-next,
        .carousel-control-prev {
            filter: invert(100%);
        }
        .carousel-control-next {
            right: -8rem;
        }
        .carousel-control-prev {
            left: -8rem;
        }
        .carousel-item.active, .carousel-item-next, .carousel-item-prev {
          display: flex;
          flex-wrap: wrap;
        }
        .container {
          padding-left: 0;
          padding-right: 0;
        }
        .carousel-indicators {
          display: none;
        `}
            </style>

            {isDashboard ? (
                <div className='pb-1 border-bottom display-6'>
                    <h2 style={titleStyle}>{sectionTitle ? capitalizeFirstLetterEachWord(sectionTitle) : ''} Posts</h2>
                    {showCustomFilter === false ? null : <BsFilter onMouseOver={mouseHoverPointer} style={filterButtonStyle} onClick={() => {setShowModal(!showModal);}} size={30} />}
                </div>
            ) : (
                <div className='pb-1 border-bottom display-6 text-left'>
                    <h2 style={titleStyle}>{sectionTitle ? capitalizeFirstLetterEachWord(sectionTitle) : ''} Posts</h2>
                    {showCustomFilter === false ? null : <BsFilter onMouseOver={mouseHoverPointer} style={filterButtonStyle} onClick={() => {setShowModal(!showModal);}} size={30} />}

                </div>
            )}

            <Carousel controls={true} interval={null} slide={true} fade={false}>
                {[...Array(topIdeasPages)].map((x, i) => (
                    <Carousel.Item key={i}>
                        {topIdeas && allProposals
                            ? topIdeas.slice(i * 6, i * 6 + 6).map((idea) => {
                                // @ts-ignore
                                return doesIdeaPassFilter(idea) ?
                                    (
                                        <Col
                                            key={idea.id}
                                            md={6}
                                            lg={4}
                                            className='pt-3 align-items-stretch'
                                        >
                                            {idea.state === 'IDEA' ?
                                                <IdeaTile
                                                    ideaData={idea}
                                                    showFooter={true}
                                                    postType={'Idea'}
                                                />
                                                :
                                                <ProposalTile
                                                    proposalData={ {id: allProposals!.filter(obj => { if (obj.ideaId == idea.id) return obj;})[0]?.id, ideaId: idea.id, idea} }
                                                    showFooter={true}
                                                    postType={'Proposal'}
                                                />
                                            }

                                        </Col>
                                    ) : null;})
                            : [...Array(16)].map((x, i) => (
                                <Col
                                    key={i}
                                    md={6}
                                    lg={4}
                                    className='pt-3 align-items-stretch'
                                >
                                    <PlaceholderIdeaTile />
                                </Col>
                            ))}
                    </Carousel.Item>
                ))}
            </Carousel>

            <Modal show={showModal} onHide={handleModalCancel} animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Customize Specified Community</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div onClick={() => {setCategoriesOpen(!isCategoriesOpen);}} onMouseOver={mouseHoverPointer}>
                        <h5 style={modalSectionTitle} >Categories</h5>
                        <div style={modalSectionIcon}>
                            {isCategoriesOpen ? <IoIosArrowDown /> : <IoIosArrowUp/>}
                        </div>
                    </div>
                    <hr />
                    <Collapse in={isCategoriesOpen}>
                        <div>
                            {categories &&
              categories.map((category, i) => {
                  return (
                      <div key={i}>
                          <input
                              defaultChecked={filterConfig.category.includes(category.id)}
                              type='checkbox'
                              id={category.title}
                              name={category.title}
                              value={category.id}
                              onClick={(e) => handleCategory(e, category.id)}/>
                          <label style={{paddingLeft:'10px'}} htmlFor={category.title}>{capitalizeFirstLetterEachWord(category.title)}</label>
                      </div>
                  );
              })
                            }
                        </div>
                    </Collapse>
                    <br />
                    {/* <h5 onClick={() => {setImpactOpen(!isImpactOpen)}} onMouseOver={mouseHoverPointer}>Impact Areas</h5> */}
                    <div onClick={() => {setImpactOpen(!isImpactOpen);}} onMouseOver={mouseHoverPointer}>
                        <h5 style={modalSectionTitle} >Impact Areas</h5>
                        <div style={modalSectionIcon}>
                            {isImpactOpen ? <IoIosArrowDown /> : <IoIosArrowUp/>}
                        </div>
                    </div>
                    <hr />
                    <Collapse in={isImpactOpen}>
                        <div>
                            <div>
                                <input defaultChecked={filterConfig.impactArea.includes('communityImpact')} type='checkbox' id='communityAndPlace' name='communityAndPlace' value='communityImpact' onClick={(e) => handleImpactArea(e, 'communityImpact')}/>
                                <label style={{paddingLeft:'10px'}} htmlFor='communityAndPlace'>Community and Place</label>
                            </div>
                            <div>
                                <input defaultChecked={filterConfig.impactArea.includes('natureImpact')} type='checkbox' id='natureAndFoodSecurity' name='natureAndFoodSecurity' value='natureImpact' onClick={(e) => handleImpactArea(e, 'natureImpact')}/>
                                <label style={{paddingLeft:'10px'}} htmlFor='natureAndFoodSecurity'>Nature and Food Security</label>
                            </div>
                            <div>
                                <input defaultChecked={filterConfig.impactArea.includes('artsImpact')} type='checkbox' id='artsCultureAndEducation' name='artsCultureAndEducation' value='artsImpact' onClick={(e) => handleImpactArea(e, 'artsImpact')}/>
                                <label style={{paddingLeft:'10px'}} htmlFor='artsCultureAndEducation'>Arts, Culture, and Education</label>
                            </div>
                            <div>
                                <input defaultChecked={filterConfig.impactArea.includes('energyImpact')} type='checkbox' id='waterAndEnergy' name='waterAndEnergy' value='energyImpact' onClick={(e) => handleImpactArea(e, 'energyImpact')}/>
                                <label style={{paddingLeft:'10px'}} htmlFor='waterAndEnergy'>Water and Energy</label>
                            </div>
                            <div>
                                <input defaultChecked={filterConfig.impactArea.includes('manufacturingImpact')} type='checkbox' id='manufacturingAndWaste' name='manufacturingAndWaste' value='manufacturingImpact' onClick={(e) => handleImpactArea(e, 'manufacturingImpact')}/>
                                <label style={{paddingLeft:'10px'}} htmlFor='manufacturingAndWaste'>Manufacturing and Waste</label>
                            </div>
                        </div>
                    </Collapse>
                    <br />

                    {/* <h5 onClick={() => {setSuperSegOpen(!isSuperSegOpen)}} onMouseOver={mouseHoverPointer}>District</h5> */}
                    <div onClick={() => {setSuperSegOpen(!isSuperSegOpen);}} onMouseOver={mouseHoverPointer}>
                        <h5 style={modalSectionTitle} >District</h5>
                        <div style={modalSectionIcon}>
                            {isSuperSegOpen ? <IoIosArrowDown /> : <IoIosArrowUp/>}
                        </div>
                    </div>
                    <hr />
                    <Collapse in={isSuperSegOpen}>
                        <div>
                            {allSuperSegments &&
              allSuperSegments.map((superSeg, i) => {
                  return (
                      <div key={i}>
                          <input
                              defaultChecked={filterConfig.superSeg.includes(superSeg.superSegId)}
                              type='checkbox'
                              id={superSeg.name}
                              name={superSeg.name}
                              value={superSeg.superSegId}
                              onClick={(e) => {handleSuperSeg(e, superSeg.superSegId);}}
                          />
                          <label style={{paddingLeft:'10px'}} htmlFor={superSeg.name}>{capitalizeFirstLetterEachWord(superSeg.name)}</label>
                      </div>
                  );
              })
                            }
                        </div>
                    </Collapse>
                    <br />
                    {/* <h5 onClick={() => {setSegOpen(!isSegOpen)}} onMouseOver={mouseHoverPointer}>Municipality</h5> */}
                    <div onClick={() => {setSegOpen(!isSegOpen);}} onMouseOver={mouseHoverPointer}>
                        <h5 style={modalSectionTitle} >Municipality</h5>
                        <div style={modalSectionIcon}>
                            {isSegOpen ? <IoIosArrowDown /> : <IoIosArrowUp/>}
                        </div>
                    </div>
                    <hr />
                    <Collapse in={isSegOpen}>
                        <div>
                            {allSegments &&
              allSegments.map((seg, i) => {
                  return (
                      <div key={i}>
                          <input
                              type='checkbox'
                              defaultChecked={filterConfig.seg.includes(seg.segId)}
                              id={seg.name}
                              name={seg.name}
                              value={seg.segId}
                              onClick={e => handleSeg(e, seg.segId)}/>
                          <label style={{paddingLeft:'10px'}} htmlFor={seg.name}>{capitalizeFirstLetterEachWord(seg.name)}</label>
                      </div>
                  );
              })
                            }
                        </div>
                    </Collapse>
                    <br />

                    {/* <h5 onClick={() => {setPostStatusOpen(!isPostStatusOpen)}} onMouseOver={mouseHoverPointer}>Post Status</h5> */}
                    <div onClick={() => {setPostStatusOpen(!isPostStatusOpen);}} onMouseOver={mouseHoverPointer}>
                        <h5 style={modalSectionTitle} >Post Status</h5>
                        <div style={modalSectionIcon}>
                            {isPostStatusOpen ? <IoIosArrowDown /> : <IoIosArrowUp/>}
                        </div>
                    </div>
                    <hr />
                    <Collapse in={isPostStatusOpen} >
                        <div>
                            {postStatuses &&
              postStatuses.map((status, i) => {
                  return (
                      <div key={i}>
                          <input
                              type='checkbox'
                              defaultChecked={filterConfig.status.includes(status)}
                              id={status}
                              name={status}
                              value={status}
                              onClick={e => handlePostStatus(e, status)}/>
                          <label style={{paddingLeft:'10px'}} htmlFor={status}>{capitalizeFirstLetterEachWord(status)}</label>
                      </div>
                  );
              })
                            }
                        </div>
                    </Collapse>
                    <br />



                </Modal.Body>
            </Modal>

        </Container>
    );
};

export default SpecifiedCommunitySection;

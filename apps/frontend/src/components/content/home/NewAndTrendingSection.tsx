import { Container, Col, Carousel, Modal, Collapse } from "react-bootstrap";
import { BsFilter } from "react-icons/bs";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { useState } from "react";
import { useCategories } from "src/hooks/categoryHooks";
import { useAllProposals } from "src/hooks/proposalHooks";
import { useAllSuperSegments, useAllSegments } from "src/hooks/segmentHooks";
import PlaceholderIdeaTile from "src/components/tiles/PlaceholderIdeaTile";
import ProposalTile from "src/components/tiles/ProposalTile";
import IdeaTile from "src/components/tiles/IdeaTile";
import LoadingSpinner from "src/components/ui/misc/LoadingSpinner";
import ErrorMessage from "src/components/ui/misc/ErrorMessage";
import { type IIdeaWithAggregations } from "@/lib/types/ideas/idea.types";
import { capitalize } from "src/lib/utils";

type IIdeaWithNew = IIdeaWithAggregations & { isNew?: boolean };

type FilterConfig = {
  endorsementFilter: "ratingFilter" | "viewsFilter" | "likesFilter" | "";
  category: number[];
  impactArea: string[];
  superSeg: number[];
  seg: number[];
  status: string[];
};

const DEFAULT_FILTER: FilterConfig = {
  endorsementFilter: "",
  category: [],
  impactArea: [],
  superSeg: [],
  seg: [],
  status: [],
};

type NewAndTrendingProps = {
  topIdeas: IIdeaWithNew[];
  postType?: string;
  isDashboard?: boolean;
  showCustomFilter?: boolean;
  isLoading?: boolean;
  isError?: boolean;
};

const NEW_POST_DAYS = 10;

const isIdeaNew = (idea: IIdeaWithNew): boolean => {
  const daysDiff =
    (Date.now() - new Date(idea.createdAt).getTime()) / (1000 * 3600 * 24);
  return daysDiff <= NEW_POST_DAYS;
};

const calculateScore = (idea: IIdeaWithNew): number => {
  const daysDiff =
    (Date.now() - new Date(idea.createdAt).getTime()) / (1000 * 3600 * 24);
  const decay = Math.max(0, 1 - daysDiff / NEW_POST_DAYS);
  return (
    (idea.ratingAvg ?? 0) * 1 +
    (isIdeaNew(idea) ? 2.4 : 0) * decay +
    (idea.posRatings ?? 0) * 1 -
    (idea.negRatings ?? 0) * 1.5
  );
};

const NewAndTrendingSection = ({
  topIdeas = [],
  postType,
  isDashboard,
  showCustomFilter,
  isLoading: sectionIsLoading,
  isError: sectionIsError,
}: NewAndTrendingProps) => {
  const [showModal, setShowModal] = useState(false);
  const [filterConfig, setFilterConfig] =
    useState<FilterConfig>(DEFAULT_FILTER);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCategoriesOpen, setCategoriesOpen] = useState(false);
  const [isImpactOpen, setImpactOpen] = useState(false);
  const [isSuperSegOpen, setSuperSegOpen] = useState(false);
  const [isSegOpen, setSegOpen] = useState(false);
  const [isPostStatusOpen, setPostStatusOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(true);

  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesIsError,
  } = useCategories();
  const { data: allSegments } = useAllSegments();
  const { data: allSuperSegments } = useAllSuperSegments();
  const { data: allProposals } = useAllProposals();

  const isLoading = sectionIsLoading || categoriesLoading;
  const isError = sectionIsError || categoriesIsError;

  const postStatuses = ["IDEA", "PROPOSAL", "PROJECT"];
  const itemsPerPage = 6;

  const toggleArrayFilter = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const doesIdeaPassFilter = (idea: IIdeaWithNew): boolean => {
    if (!idea.active) return false;
    if (
      filterConfig.category.length &&
      !filterConfig.category.includes(idea.categoryId)
    )
      return false;
    if (
      filterConfig.impactArea.length &&
      !filterConfig.impactArea.every((area) => idea[area as keyof IIdeaWithNew])
    )
      return false;
    if (
      filterConfig.superSeg.length &&
      !filterConfig.superSeg.includes(idea.superSegId ?? -1)
    )
      return false;
    if (filterConfig.seg.length && !filterConfig.seg.includes(idea.segId ?? -1))
      return false;
    if (filterConfig.status.length && !filterConfig.status.includes(idea.state))
      return false;
    return true;
  };

  const sortedIdeas = [...topIdeas].sort((a, b) => {
    const diff = calculateScore(b) - calculateScore(a);
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (filterConfig.endorsementFilter === "ratingFilter") {
    sortedIdeas.sort((a, b) => b.ratingAvg - a.ratingAvg);
  } else if (filterConfig.endorsementFilter === "viewsFilter") {
    sortedIdeas.sort((a, b) => b.engagements - a.engagements);
  } else if (filterConfig.endorsementFilter === "likesFilter") {
    sortedIdeas.sort((a, b) => {
      const ratioA = a.posRatings / (a.posRatings + a.negRatings) || 0;
      const ratioB = b.posRatings / (b.posRatings + b.negRatings) || 0;
      return ratioB - ratioA;
    });
  }

  const filteredIdeas = sortedIdeas.filter(doesIdeaPassFilter);
  const totalPages = Math.ceil(filteredIdeas.length / itemsPerPage);

  return (
    <Container className="system" id="hanging-icons">
      <style>{`
        .carousel-control-next, .carousel-control-prev { position: absolute; top: 50%; transform: translateY(-50%); width: auto; filter: invert(100%); }
        .carousel-item.active, .carousel-item-next, .carousel-item-prev { display: flex; flex-wrap: wrap; }
        .carousel-indicators { display: none; }
        .carousel-inner { padding: 1.5rem; }
      `}</style>

      <div
        className={`pb-1 border-bottom display-6 ${isDashboard ? "" : "text-left"}`}
      >
        <h2 style={{ display: "inline", paddingInline: "2.5rem" }}>
          New and Trending
        </h2>
        {showCustomFilter !== false && (
          <BsFilter
            style={{ float: "right", cursor: "pointer" }}
            onClick={() => setShowModal(!showModal)}
            size={30}
          />
        )}
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && isError && (
        <ErrorMessage message="There was an error loading the new and trending section." />
      )}
      {!isLoading && !isError && (
        <>
          <Carousel
            activeIndex={activeIndex}
            onSelect={(i) => i >= 0 && i < totalPages && setActiveIndex(i)}
            controls
            interval={null}
            slide
            fade={false}
            nextIcon={
              activeIndex >= totalPages - 1 || totalPages <= 1 ? null : (
                <span aria-hidden className="carousel-control-next-icon" />
              )
            }
            prevIcon={
              activeIndex === 0 || totalPages <= 1 ? null : (
                <span aria-hidden className="carousel-control-prev-icon" />
              )
            }
          >
            {[...Array(Math.ceil(topIdeas.length / itemsPerPage))].map(
              (_, i) => (
                <Carousel.Item key={i}>
                  {sortedIdeas && allProposals
                    ? sortedIdeas
                        .slice(
                          i * itemsPerPage,
                          i * itemsPerPage + itemsPerPage,
                        )
                        .map((idea) =>
                          doesIdeaPassFilter(idea) ? (
                            <Col
                              key={idea.id}
                              md={6}
                              lg={4}
                              className="pt-3 align-items-stretch"
                            >
                              {idea.state === "IDEA" ? (
                                <IdeaTile
                                  ideaData={idea}
                                  showFooter
                                  postType="Idea"
                                />
                              ) : (
                                <ProposalTile
                                  proposalData={{
                                    id:
                                      allProposals.find(
                                        (p) => p.ideaId === idea.id,
                                      )?.id ?? 0,
                                    ideaId: idea.id,
                                    idea,
                                  }}
                                  showFooter
                                  postType="Proposal"
                                />
                              )}
                            </Col>
                          ) : null,
                        )
                    : [...Array(12)].map((_, j) => (
                        <Col
                          key={j}
                          md={6}
                          lg={4}
                          className="pt-3 align-items-stretch"
                        >
                          <PlaceholderIdeaTile />
                        </Col>
                      ))}
                </Carousel.Item>
              ),
            )}
          </Carousel>

          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            animation={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>Customize New and Trending</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Filter section */}
              <div
                onClick={() => setFilterOpen(!isFilterOpen)}
                style={{ cursor: "pointer" }}
              >
                <h5 style={{ display: "inline" }}>Filter</h5>
                <div style={{ float: "right" }}>
                  {isFilterOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
                </div>
              </div>
              <hr />
              <Collapse in={isFilterOpen}>
                <div>
                  {(
                    ["", "ratingFilter", "viewsFilter", "likesFilter"] as const
                  ).map((val) => (
                    <div key={val}>
                      <input
                        type="radio"
                        name="endorsementFilter"
                        value={val}
                        checked={filterConfig.endorsementFilter === val}
                        onChange={() =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            endorsementFilter: val,
                          }))
                        }
                      />
                      <label style={{ paddingLeft: 10 }}>
                        {val === ""
                          ? "No Filter"
                          : val === "ratingFilter"
                            ? "By Star Rating"
                            : val === "viewsFilter"
                              ? "By Views"
                              : "By Like:Dislike Ratio"}
                      </label>
                    </div>
                  ))}
                </div>
              </Collapse>
              <br />

              {/* Categories */}
              <div
                onClick={() => setCategoriesOpen(!isCategoriesOpen)}
                style={{ cursor: "pointer" }}
              >
                <h5 style={{ display: "inline" }}>Categories</h5>
                <div style={{ float: "right" }}>
                  {isCategoriesOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
                </div>
              </div>
              <hr />
              <Collapse in={isCategoriesOpen}>
                <div>
                  {categories?.map((cat) => (
                    <div key={cat.id}>
                      <input
                        type="checkbox"
                        id={cat.title}
                        checked={filterConfig.category.includes(cat.id)}
                        onChange={() =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            category: toggleArrayFilter(prev.category, cat.id),
                          }))
                        }
                      />
                      <label style={{ paddingLeft: 10 }} htmlFor={cat.title}>
                        {capitalize(cat.title)}
                      </label>
                    </div>
                  ))}
                </div>
              </Collapse>
              <br />

              {/* Impact Areas */}
              <div
                onClick={() => setImpactOpen(!isImpactOpen)}
                style={{ cursor: "pointer" }}
              >
                <h5 style={{ display: "inline" }}>Impact Areas</h5>
                <div style={{ float: "right" }}>
                  {isImpactOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
                </div>
              </div>
              <hr />
              <Collapse in={isImpactOpen}>
                <div>
                  {[
                    { id: "communityImpact", label: "Community and Place" },
                    { id: "natureImpact", label: "Nature and Food Security" },
                    { id: "artsImpact", label: "Arts, Culture, and Education" },
                    { id: "energyImpact", label: "Water and Energy" },
                    {
                      id: "manufacturingImpact",
                      label: "Manufacturing and Waste",
                    },
                  ].map(({ id, label }) => (
                    <div key={id}>
                      <input
                        type="checkbox"
                        id={id}
                        checked={filterConfig.impactArea.includes(id)}
                        onChange={() =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            impactArea: toggleArrayFilter(prev.impactArea, id),
                          }))
                        }
                      />
                      <label style={{ paddingLeft: 10 }} htmlFor={id}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </Collapse>
              <br />

              {/* District */}
              <div
                onClick={() => setSuperSegOpen(!isSuperSegOpen)}
                style={{ cursor: "pointer" }}
              >
                <h5 style={{ display: "inline" }}>District</h5>
                <div style={{ float: "right" }}>
                  {isSuperSegOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
                </div>
              </div>
              <hr />
              <Collapse in={isSuperSegOpen}>
                <div>
                  {allSuperSegments?.map((ss) => (
                    <div key={ss.superSegId}>
                      <input
                        type="checkbox"
                        id={ss.name}
                        checked={filterConfig.superSeg.includes(ss.superSegId)}
                        onChange={() =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            superSeg: toggleArrayFilter(
                              prev.superSeg,
                              ss.superSegId,
                            ),
                          }))
                        }
                      />
                      <label style={{ paddingLeft: 10 }} htmlFor={ss.name}>
                        {capitalize(ss.name)}
                      </label>
                    </div>
                  ))}
                </div>
              </Collapse>
              <br />

              {/* Sector */}
              <div
                onClick={() => setSegOpen(!isSegOpen)}
                style={{ cursor: "pointer" }}
              >
                <h5 style={{ display: "inline" }}>Sector</h5>
                <div style={{ float: "right" }}>
                  {isSegOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
                </div>
              </div>
              <hr />
              <Collapse in={isSegOpen}>
                <div>
                  {allSegments?.map((seg) => (
                    <div key={seg.segId}>
                      <input
                        type="checkbox"
                        id={seg.name}
                        checked={filterConfig.seg.includes(seg.segId)}
                        onChange={() =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            seg: toggleArrayFilter(prev.seg, seg.segId),
                          }))
                        }
                      />
                      <label style={{ paddingLeft: 10 }} htmlFor={seg.name}>
                        {capitalize(seg.name)}
                      </label>
                    </div>
                  ))}
                </div>
              </Collapse>
              <br />

              {/* Status */}
              <div
                onClick={() => setPostStatusOpen(!isPostStatusOpen)}
                style={{ cursor: "pointer" }}
              >
                <h5 style={{ display: "inline" }}>Status</h5>
                <div style={{ float: "right" }}>
                  {isPostStatusOpen ? <IoIosArrowDown /> : <IoIosArrowUp />}
                </div>
              </div>
              <hr />
              <Collapse in={isPostStatusOpen}>
                <div>
                  {postStatuses.map((status) => (
                    <div key={status}>
                      <input
                        type="checkbox"
                        id={status}
                        checked={filterConfig.status.includes(status)}
                        onChange={() =>
                          setFilterConfig((prev) => ({
                            ...prev,
                            status: toggleArrayFilter(prev.status, status),
                          }))
                        }
                      />
                      <label style={{ paddingLeft: 10 }} htmlFor={status}>
                        {capitalize(status)}
                      </label>
                    </div>
                  ))}
                </div>
              </Collapse>
            </Modal.Body>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default NewAndTrendingSection;

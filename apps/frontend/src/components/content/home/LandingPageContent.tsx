import React from "react";
import { Container, Row } from "react-bootstrap";
import CategoriesSection from "./CategoriesSection";
import DescriptionSection from "./DescriptionSection";
import HeroBannerSection from "./HeroBannerSection";
import NewAndTrendingSection from "./NewAndTrendingSection";
import { AdsSection } from "./AdsSection";
import { type IIdeaWithAggregations } from "@/lib/types/ideas/idea.types";
import { type IFetchError } from "src/lib/types/general/error.types";

interface LandingPageContentProps {
  topIdeas: IIdeaWithAggregations[] | undefined;
  ideasLoading: boolean;
  ideasIsError: boolean;
  ideasError: IFetchError | null;
}

const LandingPageContent: React.FC<LandingPageContentProps> = ({
  topIdeas,
  ideasLoading,
  ideasIsError,
}) => {
  return (
    <Container className="landing-page-content">
      <HeroBannerSection />
      <Row as="article" className="featured"></Row>

      <Row as="article" className="new-and-trending">
        <NewAndTrendingSection
          topIdeas={topIdeas!}
          isDashboard={false}
          isLoading={ideasLoading}
          isError={ideasIsError}
        />
      </Row>

      <Row as="article" className="categories" style={{ margin: "0" }}>
        <CategoriesSection />
      </Row>

      <Row className="d-none d-md-block">
        <AdsSection />
      </Row>

      <Row as="article" className="description" style={{ margin: "0" }}>
        <DescriptionSection />
      </Row>
    </Container>
  );
};

export default LandingPageContent;

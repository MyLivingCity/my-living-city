import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { IIdeaWithAggregations } from '../../lib/types/data/idea.type';
import { IFetchError } from '../../lib/types/types';
import CategoriesSection from '../partials/LandingContent/CategoriesSection';
import DescriptionSection from '../partials/LandingContent/DescriptionSection';
import HeroBannerSection from '../partials/LandingContent/HeroBannerSection';
import NewAndTrendingSection from '../partials/LandingContent/NewAndTrendingSection';

import { AdsSectionPage } from 'src/pages/AdsSectionPage';

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
  ideasError,
}) => {
  return (
    <Container className="landing-page-content">
      <HeroBannerSection />
      <Row as="article" className="featured"></Row>

      <Row as="article" className="new-and-trending">
        <NewAndTrendingSection topIdeas={topIdeas!} isDashboard={false} isLoading={ideasLoading} isError={ideasIsError}/>
      </Row>

      <Row as="article" className="categories">
        <CategoriesSection />
      </Row>

      {/* Desktop View >= 768px */}
      <Row className="d-none d-md-block">
        <AdsSectionPage />
      </Row>

      <Row as="article" className="description">
        <DescriptionSection />
      </Row>
    </Container>
  );
};

export default LandingPageContent;

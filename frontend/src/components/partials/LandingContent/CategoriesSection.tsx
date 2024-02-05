import { Col, Container, Image, Row, Popover, OverlayTrigger} from 'react-bootstrap'
export const CONTENT = {
  community: {
    header: 'Community & Place',
    subHeader: 'How do we build community to a human scale, allowing equity, inclusivity, and peace?',
    body: 
    `- Having a good mix of private and public spaces
    - Open spaces for people to meet and play
    - Designing neighborhoods that work for community
    - Walkable neighborhoods where you can live, work and play within manageable walking distances
    - Creating inclusive and accessible communities for everyone
    - Creating opportunities for equality`
  },
  nature: {
    header: 'Nature & Food Security',
    subHeader: 'How do we ensure access to nature, protect the existence of nature around us and guarantee our food supply?',
    body: `- Protecting our natural spaces from development
    - Integrating natural spaces inside the city with urban forests or micro park systems
    - Creating spaces and opportunities for urban agriculture & community gardens
    - Prioritizing local food production
    - Community based food sharing programs`
  },
  arts: {
    header: 'Arts, Culture & Education',
    subHeader: 'How do you allow human expression to flourish, and enable people to flourish?',
    body: `- Spaces for arts and performance in public places
    - Expression of arts integrated in design of public spaces and buildings
    - Having spaces for classes and learning in the community (children and adults)`
  },
  manufacturing: {
    header: 'Manufacturing & Waste',
    subHeader: 'How do we meet our material needs without exhausting the planet?',
    body: `-  Using recycled materials and processes where the waste from development gets repurposed into new products or projects.
    - Using materials that are non-toxic and do not cause damage to the environment
    - Using manufacturing techniques that use less materials
    - Creating new products that are easily recyclable or re-used once done
    - Having any disposable or single used products be compostable`
  },
  water: {
    header: 'Water & Energy',
    subHeader: 'How do we power our city and provide water sustainably?',
    body: `- Using renewable power sources
    - Building energy efficient products and systems   
    - Building water efficient products and systems    
    - Re-using and Recycling waste water and using waterless systems    
    - Rainwater recycling
    - Natural stormwater management (rain gardens, pond systems, ect…)`
  },
}
interface ToastieProps {
  header: string;
  subHeader: string;
  body: string;
  img: string;
  sizePercent?: string;
}
export const Toastie: React.FC<ToastieProps> = ({header, subHeader, body, img, sizePercent}) => {
  let arr = body.split('\n');
  return(
    <OverlayTrigger
      trigger="click"
      key={header}
      rootClose={true}
      overlay={
        <Popover id={`popover-positioned-top`}>
          <Popover.Title as="h3">{header}</Popover.Title>
          <Popover.Content>
            <strong>{subHeader}</strong><br/>
            {arr.map((line)=>< div key={line}><p>{line}</p></div>)}
          </Popover.Content>
        </Popover>
      }
    >
      <Image className='d-block mx-auto' width={sizePercent ? sizePercent : '70%'} src={img} />
    </OverlayTrigger>
    )
}
interface CategoriesSectionProps{}
const CategoriesSection = (props: CategoriesSectionProps) => {

  return (
    <Container className="py-5">
      <h2 className="pb-1 border-bottom display-6 text-left">Impact Areas</h2>
      <Row className='justify-content-center g-5 pt-4'>
        <Col xs={6} sm={4} lg={2}>
        <a href="javascript:void(0)"><Toastie header={CONTENT.nature.header} subHeader={CONTENT.nature.subHeader} body={CONTENT.nature.body} img="/categories/MLC-Icons-Green-01.png"/></a>
          <p className='text-center py-3'>Nature and Food Security</p>
        </Col>
        <Col xs={6} sm={4} lg={2}>
        <a href="javascript:void(0)"><Toastie header={CONTENT.water.header} subHeader={CONTENT.water.subHeader} body={CONTENT.water.body} img="/categories/MLC-Icons-Green-02.png"/></a>
          <p className='text-center py-3'>Water & Energy</p>
        </Col>
        <Col xs={6} sm={4} lg={2}>
        <a href="javascript:void(0)"><Toastie header={CONTENT.manufacturing.header} subHeader={CONTENT.manufacturing.subHeader} body={CONTENT.manufacturing.body} img="/categories/MLC-Icons-Green-03.png"/></a>
          <p className='text-center py-3'>Manufacturing & Waste</p>
        </Col>
        <Col xs={6} sm={4} lg={2}>
        <a href="javascript:void(0)"><Toastie header={CONTENT.arts.header} subHeader={CONTENT.arts.subHeader} body={CONTENT.arts.body} img="/categories/MLC-Icons-Green-04.png"/></a>
          <p className='text-center py-3'>Arts, Culture & Education</p>
        </Col>
        <Col xs={6} sm={4} lg={2}>
        <a href="javascript:void(0)"><Toastie header={CONTENT.community.header} subHeader={CONTENT.community.subHeader} body={CONTENT.community.body} img="/categories/MLC-Icons-Green-05.png"/></a>
          <p className='text-center py-3'>Community & Place</p>
        </Col>
      </Row>
    </Container>
  )
}

export default CategoriesSection
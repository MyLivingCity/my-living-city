import {
  Col,
  Container,
  Image,
  Row,
  Popover,
  OverlayTrigger,
} from "react-bootstrap";
import { HOME_CONTENT } from "src/lib/constants/home.content";

type ToastieProps = {
  header: string;
  subHeader: string;
  body: string;
  img: string;
  sizePercent?: string;
};

const Toastie = ({
  header,
  subHeader,
  body,
  img,
  sizePercent,
}: ToastieProps) => {
  const lines = body.split("\n").filter((l) => l.trim());
  return (
    <OverlayTrigger
      trigger="click"
      key={header}
      rootClose
      overlay={
        <Popover id={`popover-${header}`}>
          <Popover.Header as="h3">{header}</Popover.Header>
          <Popover.Body>
            <strong>{subHeader}</strong>
            <br />
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </Popover.Body>
        </Popover>
      }
    >
      <Image
        className="d-block mx-auto"
        width={sizePercent ?? "70%"}
        src={img}
      />
    </OverlayTrigger>
  );
};

const CATEGORY_ITEMS = [
  {
    content: HOME_CONTENT.nature,
    img: "/categories/MLC-Icons-Green-01.png",
    label: "Nature and Food Security",
  },
  {
    content: HOME_CONTENT.water,
    img: "/categories/MLC-Icons-Green-02.png",
    label: "Water & Energy",
  },
  {
    content: HOME_CONTENT.manufacturing,
    img: "/categories/MLC-Icons-Green-03.png",
    label: "Manufacturing & Waste",
  },
  {
    content: HOME_CONTENT.arts,
    img: "/categories/MLC-Icons-Green-04.png",
    label: "Arts, Culture & Education",
  },
  {
    content: HOME_CONTENT.community,
    img: "/categories/MLC-Icons-Green-05.png",
    label: "Community & Place",
  },
];

const CategoriesSection = () => (
  <Container className="py-5">
    <h2
      className="pb-1 border-bottom display-6 text-left"
      style={{ paddingInline: "1rem" }}
    >
      Impact Areas
    </h2>
    <Row className="justify-content-center g-5 pt-4">
      {CATEGORY_ITEMS.map(({ content, img, label }) => (
        <Col key={label} xs={4} sm={3} lg={2}>
          <Toastie
            header={content.header}
            subHeader={content.subHeader}
            body={content.body}
            img={img}
          />
          <p className="text-center p-2">{label}</p>
        </Col>
      ))}
    </Row>
  </Container>
);

export default CategoriesSection;

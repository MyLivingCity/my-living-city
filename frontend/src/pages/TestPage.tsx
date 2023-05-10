import React, { useState } from "react";
import { Container, Jumbotron, Alert, Button } from "react-bootstrap";

function AlertDimissibleExample() {
  const [show, setShow] = useState(false);

  //test commit changes

  if (show) {
    return (
      <Alert variant="danger" onClose={() => setShow(false)} dismissible>
        <Alert.Heading>
          I am an alert of type <span className="dangerText">danger</span>! but
          my color is Teal!
        </Alert.Heading>
        <p>
          By the way the button you just clicked is an{" "}
          <span className="infoText">Info</span> button but is using the color
          Tomato. Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          Accusantium debitis deleniti distinctio impedit officia reprehenderit
          suscipit voluptatibus. Earum, nam necessitatibus!
        </p>
      </Alert>
    );
  }

  return (
    <Button variant="info" onClick={() => setShow(true)}>
      Show Custom Styled alert
    </Button>
  );
}

export default function TestPage() {
  return (
    <Container className="p-3">
      <Jumbotron className="pb-1">
        <h1 className="header">Welcome to React-Bootstrap</h1>
        <h1 className="header">Using Sass with custom theming</h1>
        <AlertDimissibleExample />
        <hr />
        <p>
          You can check further in information on the official Bootstrap docs{" "}
          <a
            href="https://getbootstrap.com/docs/4.3/getting-started/theming/#importing"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      </Jumbotron>
    </Container>
  );
}

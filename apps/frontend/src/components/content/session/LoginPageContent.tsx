import { useState } from "react";
import { Image, Form, Button, Alert, Card } from "react-bootstrap";
import { ROUTES } from "@lib/constants";
import { useFormik } from "formik";
import { Link } from "react-router-dom";

export interface ILoginWithEmailAndPass {
  email: string;
  password: string;
}

export default function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showError, setShowError] = useState(true);

  const formik = useFormik<ILoginWithEmailAndPass>({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async () => {
      try {
        setIsLoading(true);
        setError(null);

        formik.resetForm();
      } catch (err: unknown) {
        console.error("Error logging in user:", err);

        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("Something went wrong"));
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <main className="login-page-content">
      <Card>
        <Card.Body className="my-5">
          <Image
            className="mb-4"
            src="/MyLivingCity_Logo_NameOnly.png"
            alt="MyLivingCity Logo"
            fluid
          />

          {error && (
            <Alert
              show={showError}
              onClose={() => setShowError(false)}
              dismissible
              variant="danger"
              className="error-alert"
            >
              {error.message}
            </Alert>
          )}

          <Form onSubmit={formik.handleSubmit}>
            <Form.Group controlId="loginEmail" className="mt-2">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                name="email"
                type="email"
                required
                placeholder="Enter email"
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              <Form.Text className="text-muted">
                We'll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="loginPassword" className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                required
                placeholder="Password"
                onChange={formik.handleChange}
                value={formik.values.password}
              />
            </Form.Group>

            <Button className="w-100" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Form>

          <div className="w-100 text-center mt-2">
            <Link to={ROUTES.REGISTER}>Don't have an account? Create one.</Link>
          </div>
        </Card.Body>
      </Card>
    </main>
  );
}

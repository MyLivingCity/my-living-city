import React, { useState, useEffect } from "react";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import { COUNTRIES, PROVINCES } from "src/lib/constants/constants";
import { getAllSuperSegmentsByCountryProvince } from "src/lib/api/segment.routes";
import { type ISegment, type ISuperSegment } from "src/lib/types/segment.types";
import { capitalize } from "src/lib/utils";

// Interface for component props, leverages React's Dispatch and SetStateAction for state management of country and province selections //
interface SubgroupLocationSelectorProps {
  countryName: string;
  provName: string;
  setCountryName: React.Dispatch<React.SetStateAction<string>>;
  setProvName: React.Dispatch<React.SetStateAction<string>>;
  segments: ISegment[] | undefined;
}

// Main component function leverages React's functional component syntax, accepts props for location selection and segment data //
const SubgroupLocationSelector: React.FC<SubgroupLocationSelectorProps> = ({
  countryName,
  provName,
  setCountryName,
  setProvName,
  segments,
}) => {
  const [segName, setSegName] = useState("");
  const [superSegments, setSuperSegments] = useState<ISuperSegment[]>([]);
  const [selectedSuperSegId, setSelectedSuperSegId] = useState<string>("");
  const [showForm, setShowForm] = useState(true);

  // Intended to normalize the casing on provName and countryName once where it was previously set multiple times //
  const normalizedCountry = countryName.toLowerCase();
  const normalizedProv = provName.toLowerCase();

  // If a user's location changes, fetch the super segments //
  useEffect(() => {
    if (!normalizedCountry || !normalizedProv) return;

    const fetchSuperSegments = async () => {
      try {
        const data = await getAllSuperSegmentsByCountryProvince(
          normalizedCountry,
          normalizedProv,
        );

        setSuperSegments(data);
        setSelectedSuperSegId(
          data.length > 0 ? String(data[0].superSegId) : "",
        );
      } catch (error) {
        console.error("Error fetching super segments:", error);
      }
    };

    fetchSuperSegments();
  }, [normalizedCountry, normalizedProv]);

  // Reset segment selection to empty ("") when user's location changes
  useEffect(() => {
    setSegName("");
  }, [normalizedCountry, normalizedProv]);

  // Intended to filter segments safely and apply normalized casing //
  const filteredSegments = (segments ?? []).filter(
    (segment) =>
      segment.country.toLowerCase() === normalizedCountry &&
      segment.province.toLowerCase() === normalizedProv,
  );

  // Hide form if showForm is false //
  if (!showForm) return null;

  // Render the form for all other cases //
  return (
    <Row>
      <Col>
        <Form.Group>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Select a location</span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                ×
              </Button>
            </Card.Header>

            <Card.Body>
              <Row>
                {/* Country */}
                <Col>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    size="sm"
                    as="select"
                    value={countryName}
                    onChange={(e) =>
                      setCountryName(e.target.value.toLowerCase())
                    }
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country.toLowerCase()}>
                        {country}
                      </option>
                    ))}
                  </Form.Control>
                </Col>

                {/* Province */}
                <Col>
                  <Form.Label>Province</Form.Label>
                  <Form.Control
                    size="sm"
                    as="select"
                    value={provName}
                    onChange={(e) => setProvName(e.target.value.toLowerCase())}
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov.toLowerCase()}>
                        {prov}
                      </option>
                    ))}
                  </Form.Control>
                </Col>

                {/* SuperSegment */}
                <Col>
                  <Form.Label>SuperSegment</Form.Label>
                  <Form.Control
                    as="select"
                    size="sm"
                    value={selectedSuperSegId}
                    onChange={(e) => setSelectedSuperSegId(e.target.value)}
                    disabled={superSegments.length === 0}
                  >
                    {superSegments.length === 0 ? (
                      <option disabled>
                        No SuperSegment matches this location
                      </option>
                    ) : (
                      <>
                        <option value="">All</option>
                        {superSegments.map((superSeg) => (
                          <option
                            key={superSeg.superSegId}
                            value={String(superSeg.superSegId)}
                          >
                            {capitalize(superSeg.name)}
                          </option>
                        ))}
                      </>
                    )}
                  </Form.Control>
                </Col>

                {/* Segment */}
                <Col>
                  <Form.Label>Segment</Form.Label>
                  <Form.Control
                    as="select"
                    size="sm"
                    value={segName}
                    onChange={(e) => setSegName(e.target.value)}
                    disabled={filteredSegments.length === 0}
                  >
                    {filteredSegments.length === 0 ? (
                      <option disabled>No segments match this location</option>
                    ) : (
                      <>
                        <option value="">All</option>
                        {filteredSegments.map((segment) => (
                          <option key={segment.segId} value={segment.name}>
                            {capitalize(segment.name)}
                          </option>
                        ))}
                      </>
                    )}
                  </Form.Control>
                </Col>

                {/* SubSegment */}
                <Col>
                  <Form.Label>SubSegment</Form.Label>
                  <Form.Control as="select" size="sm" disabled>
                    <option value=""></option>
                  </Form.Control>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Form.Group>
      </Col>
    </Row>
  );
};

export default SubgroupLocationSelector;

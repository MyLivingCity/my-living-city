import React, { useState, useEffect } from "react";
import { Row, Col, Form, Card, Button } from "react-bootstrap";
import { COUNTRIES, PROVINCES } from "src/lib/constants";
import { getAllSuperSegmentsByCountryProvince } from "../../lib/api/segmentRoutes";
import { ISegment, ISuperSegment } from "../../lib/types/data/segment.type";
import { capitalizeFirstLetterEachWord } from "src/lib/utilityFunctions";

interface SubgroupLocationSelectorProps {
  countryName: string;
  provName: string;
  setCountryName: React.Dispatch<React.SetStateAction<string>>;
  setProvName: React.Dispatch<React.SetStateAction<string>>;
  segments: ISegment[] | undefined;
}

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

  // Normalize values once
  const normalizedCountry = countryName.toLowerCase();
  const normalizedProv = provName.toLowerCase();

  // Fetch super segments when location changes
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

  // Reset segment selection when location changes
  useEffect(() => {
    setSegName("");
  }, [normalizedCountry, normalizedProv]);

  // Filter segments safely
  const filteredSegments = (segments ?? []).filter(
    (segment) =>
      segment.country.toLowerCase() === normalizedCountry &&
      segment.province.toLowerCase() === normalizedProv,
  );

  if (!showForm) return null;

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
                            {capitalizeFirstLetterEachWord(superSeg.name)}
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
                            {capitalizeFirstLetterEachWord(segment.name)}
                          </option>
                        ))}
                      </>
                    )}
                  </Form.Control>
                </Col>

                {/* SubSegment (future feature) */}
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

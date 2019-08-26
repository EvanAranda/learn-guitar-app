import React from "react";
import { Container, Row, Col } from "react-grid-system";

export interface LabeledInputProps {
  label: string;
}
export const LabeledInput: React.FunctionComponent<
  LabeledInputProps
> = props => (
  <Row nogutter justify='between' style={{ marginTop: "10px" }}>
    <Col xs={6}>
      <label>{props.label}</label>
    </Col>
    <Col xs={6}>{props.children}</Col>
  </Row>
);

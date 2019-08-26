import React from "react";
import { Preview } from "./components/Preview/Preview";
import { PreviewSettingsPane } from "./components/PreviewSettingsPane";
import { MiscellaneousSettingsPane } from "./components/MiscellaneousSettingsPane";
import { store } from "./store/Store";
import { Container, Row, Col } from "react-grid-system";
import { Footer } from "./components/Footer";

const StateProvider = store.Provider();

const App: React.FC = () => {
  return (
    <StateProvider>
      <Container fluid>
        <Row>
          <Col xs={12}>
            <Preview />
          </Col>
        </Row>
        <Row style={{ minHeight: "50%" }}>
          <Col xs={6}>
            <PreviewSettingsPane />
          </Col>
          <Col xs={6}>
            <MiscellaneousSettingsPane />
          </Col>
        </Row>
        <Footer />
      </Container>
    </StateProvider>
  );
};

export default App;

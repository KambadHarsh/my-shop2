import React from "react";
import { Page, Layout, LegacyCard, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom v6+

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Hook from react-router v6 to manipulate navigation

  const exportPage = () => {
    navigate('/newExport'); // Navigate to the 'newExport' page
  };

  return (
    <Page narrowWidth>
      <TitleBar title={t("My-Shop")} primaryAction={null} />
      <Layout>
        <Layout.Section>
          <LegacyCard title="Export" sectioned>
            <p
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ flex: 1 }}>
                Export your files easily with our app.
              </span>
              <Button onClick={exportPage} primary>
                Export
              </Button>
            </p>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <LegacyCard title="Import" sectioned>
            <p>Import your files easily with our app.</p>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

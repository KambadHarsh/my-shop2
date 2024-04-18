import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import "./app.css";



import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
  TopBar
} from "./components";


export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: t("New-Export"),
                  destination: "/newExport",
                },
                {
                  label: t("New-import"),
                  destination:"/newImport",
                }
              ]}
            />
            <div className="main-section">
              <div className="content-section">
               <TopBar/>
               <Routes pages={pages} />
              </div>
            </div>
            
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}

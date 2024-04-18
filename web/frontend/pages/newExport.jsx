import React from "react";
import { useEffect, useState } from "react";
import { CalloutCard, Box, Button, Text, Popover, Checkbox, Scrollable, List, LegacyCard, Badge, Banner,LegacyStack} from "@shopify/polaris";
import { CSVLink } from "react-csv";
import { useAuthenticatedFetch } from '../hooks'
import Papa from 'papaparse';

const checkboxData = [
  { id: 'Product', label: 'Product' },
  { id: 'MetaField', label: 'MetaField' },
  { id: 'Collection', label: 'Collection' },
  { id: 'list1', label: 'Add List' },
  { id: 'List2', label: 'Add List' },
  { id: 'list3', label: 'Add List' },
  { id: 'list4', label: 'Add List' }

];

export default function newExport({ label = '', height = 'auto', width = 'auto' }) {

  const [popoverActive, setPopoverActive] = useState(false);                            //state varaible to active/inactive popover 
  const togglePopoverActive = () => setPopoverActive(!popoverActive);                  // popup active/inactive
  const [checkboxStates, setCheckboxStates] = useState(                              //state varaible for checkbox
    checkboxData.reduce((acc, { id }) => ({ ...acc, [id]: false }), {})
  );
  const [selectedOptions, setSelectedOptions] = useState([]);                        // for change on selecting the checkbox 
  const [selectAllChecked, setSelectAllChecked] = useState(false);                    // to mark and umark  option

  //  to display product count
  const [productCount, setProductCount] = useState(0);
  const [metafieldCount, setMetafieldCount] = useState(0);

  // to display banner 
  const [successBannerVisible, setSuccessBannerVisible] = useState(false);
  const [failureBannerVisible, setFailureBannerVisible] = useState(false);

  // When a checkbox is marked  
  const handleCheckboxChange = (checkboxId, label) => {
    const updatedCheckboxStates = { ...checkboxStates, [checkboxId]: !checkboxStates[checkboxId] };
    setCheckboxStates(updatedCheckboxStates);

    const checkedOptions = checkboxData.filter(option => updatedCheckboxStates[option.id]);
    setSelectedOptions(checkedOptions);

    // Update productCount if "Product" checkbox is checked
    if (checkboxId === 'Product') {
      const isChecked = updatedCheckboxStates['Product'];
      setProductCount(isChecked ? productData.length : 0);
    }

    // Update metafieldCount if "MetaField" checkbox is checked
    if (checkboxId === 'MetaField') {
      const isChecked = updatedCheckboxStates['MetaField'];
      setMetafieldCount(isChecked ? metafields.length : 0);
    }
  };


  // function for selection all checkbox
  const handleSelectAllChange = () => {
    const allChecked = !selectAllChecked;                                      //to unmark all
    const updatedCheckboxStates = checkboxData.reduce((acc, { id }) => ({ ...acc, [id]: allChecked }), {});
    setCheckboxStates(updatedCheckboxStates);
    setSelectAllChecked(allChecked);

    // Update selectedOptions to contain all options when "Select All" is checked
    const checkedOptions = allChecked ? checkboxData : [];
    setSelectedOptions(checkedOptions);
  };

  useEffect(() => {
    const allChecked = Object.values(checkboxStates).every((isChecked) => isChecked);
    setSelectAllChecked(allChecked);

  }, [checkboxStates]);


  // -------------------------- To download data------------------------
  const exportProductData = () => {
    downloadCSV(productDataValues, productHeaderLabels, 'products.csv');
  };

  const exportMetaFieldData = () => {
    downloadCSV(metaDataValues, metaHeaderLabels, 'metafields.csv');
  };

  const exportAllData = () => {
    const combinedData = [...productDataValues, ...metaDataValues];
    downloadCSV(combinedData, [...productHeaderLabels, ...metaHeaderLabels], 'combined_data.csv');
  };

  const downloadCSV = (data, headers, filename) => {
    try {
      if (data.length === 0) {
        throw new Error("No data available for export.");
      } 
    const csv = Papa.unparse({ fields: headers, data });          // Convert data to CSV format using Papa Parse library                         
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });   //Create a Blob object containing the CSV data
    const csvURL = window.URL.createObjectURL(csvData);                  // Create a URL for the Blob object
    const tempLink = document.createElement('a');                     // Create a temporary link element
    tempLink.href = csvURL;                                         // Set the URL of the link to the CSV data URL
    tempLink.setAttribute('download', filename);               // Set the 'download' attribute of the link to the desired filename
    document.body.appendChild(tempLink);                      // Append the link to the document body(only for firefox)
    tempLink.click();                                        // Simulate a click on the link to trigger the download
    document.body.removeChild(tempLink);                        // Remove the temporary link from the document after download

    setSuccessBannerVisible(true);               
  }
   catch (error) {
    console.error("Error exporting CSV:", error);
    setFailureBannerVisible(true);
  }
  };




  let [productData, setProductData] = useState([]);
  let [metafields, setMetafields] = useState([]);

  let fetch = useAuthenticatedFetch();

  async function fetchProduct() {
    try {
      const productResponse = await fetch("/api/products/info");
      const metaResponse = await fetch("/api/metafields/product");
      const productJson = await productResponse.json();
      const metaJson = await metaResponse.json();
      console.log(productJson);
      console.log(metaJson);

      setProductData(productJson.data || []);
      setMetafields(metaJson.data || []);
      // Update productCount and metafieldCount after fetching data
      setProductCount(productJson.data ? productJson.data.length : 0);
      setMetafieldCount(metaJson.data ? metaJson.data.length : 0);

    }
    catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProduct();
  }, []);

  const productHeaders = [
    { label: "Id", key: "id" },
    { label: "Title", key: "title" },
    { label: "Handle", key: "handle" },
    { label: "Body Html ", key: "body_html" },
    { label: "Vendor", key: "vendor" },
    { label: "Tags", key: "tags" },
    { label: "Status", key: "status" },
    { label: "Created At", key: "created_at" },
    { label: "Updated At", key: "updated_at" },
    { label: "Published at", key: "published_at" },
    { label: "Varient ", key: "varients" },
  ];

// Extract labels from productHeaders using map
const productHeaderLabels = productHeaders.map(header => header.label);

// Extract keys from productHeaders using map
const productDataValues = productData.map(item =>
  productHeaders.map(header => item[header.key])
);




  // const csvData = productData.map((products) => ({
  //   id: parseInt(products.id),
  //   title: products.title,
  //   handle: products.handle,
  //   body_html: products.body_html,
  //   vendor: products.vendor,
  //   tags: products.tags,
  //   status: products.status,
  //   created_at: products.created_at,
  //   updated_at: products.updated_at,
  //   published_at: products.published_at,
  // }));


  // const metaData = metafields.map((metadata) => ({
  //   id: parseInt(metadata.id),
  //   type: metadata.type,
  //   description: metadata.description,
  //   admin_graphql_api_id: metadata.admin_graphql_api_id,
  //   key: metadata.key,
  //   namespace: metadata.namespace,
  //   owner_id: metadata.owner_id,
  //   owner_resouce: metadata.owner_resouce,
  //   created_at: metadata.created_at,
  //   updated_at: metadata.updated_at,
  //   value: metadata.value
  // }));


  const metaHeaders = [
    { label: "Id", key: "id" },
    { label: "Type", key: "type" },
    { label: "Description ", key: "description" },
    { label: "admin_graphql_api_id", key: "admin_graphql_api_id" },
    { label: "Key", key: "key" },
    { label: "Namespace", key: "namespace" },
    { label: "Created At", key: "created_at" },
    { label: "Updated At", key: "updated_at" },
    { label: "Owner_id", key: "owner_id" },
    { label: "value ", key: "value" },
  ];

// Extract labels from productHeaders using map
const metaHeaderLabels = metaHeaders.map(header => header.label);

// Extract keys from productHeaders using map
const metaDataValues = metafields.map(item =>
  metaHeaders.map(header => item[header.key])
);
  
  return (
    <div>
      <CalloutCard
        title="Export"
        illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
        primaryAction={{
          content: 'Export',
          disabled: productData.length === 0,
          onAction: () => {
            exportAllData();
          },
        }}
      >
        <p>Export your Product files here</p>

        {/* {productData.length > 0 && (
                <CSVLink data={csvData} headers={headers} filename="products.csv">
                <button>Download CSV</button>
                </CSVLink> 
                )}
                {metafields.length > 0 && (
                <CSVLink data={metaData} headers={meta_headers} filename="products.csv">
                <button>Download Meta CSV</button>
                </CSVLink> 
                )} */}

      </CalloutCard>

      {/* ---------------------------------Format Box -----------------------------------------------*/}
      <Box
        padding="loose"
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          margin: '20px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: '100px',
          position: 'relative',
          overflowY: 'auto'
        }}
      >
        {/* Heading */}
        <Box style={{ alignSelf: 'flex-start', width: '100%' }}>
          <Text variant="heading xl" as="h4" fontWeight="bold" marginBottom="20px" width="100%">
            Format
          </Text>
        </Box>

        {/* Selection List */}
        <Box style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <Popover
            active={popoverActive}
            activator={<Button fullWidth size="slim">Select type</Button>}
            onClose={togglePopoverActive}
            preferredAlignment="right"
          >
            <Popover.Pane style={{ minWidth: '200px', width: '300px' }}>
              {/* Your list of options */}
              <List
                items={[
                  { content: 'CSV', onAction: () => handleOptionSelect('Option 1') },
                  { content: 'Excel', onAction: () => handleOptionSelect('Option 2') },
                  { content: 'PDF', onAction: () => handleOptionSelect('Option 3') },
                ]}
              />
            </Popover.Pane>
          </Popover>
        </Box>
      </Box>

      {/* ---------------------------------Sheet Box -----------------------------------------------*/}
      <Box
        padding="loose"
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          margin: '20px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: '450px',
          position: 'relative',
          overflowY: 'auto'
        }}>

        {/* Heading Box */}
        <Box style={{ alignSelf: 'flex-start', width: '100%' }}>
          <Text variant="heading  xl" as="h4" fontWeight="bold" marginBottom="20px" width="100%">
            Sheets</Text>
        </Box>

        <Box style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <Button fullWidth size="slim" onClick={togglePopoverActive}>
            {checkboxStates.checkbox1 ? 'Show less' : 'Show more'}
          </Button>

           
          {/* POPover starts here */}
          <Scrollable shadow style={{ height: '100px' }} focusable>
            <Popover
              active={popoverActive}
              activator={<div />}
              onClose={togglePopoverActive}
              style={{ zIndex: 999, width: checkboxStates.checkbox1 ? 'auto' : '300px' }}
            >
              <Box style={{width:'250px',display:'flex',fontWeight:'bold'}}>
              <Popover.Pane style={{ minWidth: '200px', width: '100%  ' }}>
                <Checkbox
                  checked={selectAllChecked}
                  onChange={handleSelectAllChange}
                  label="Select All"
                />  
                {checkboxData.map(({ id, label }) => (
                  <Popover.Section key={id} style={{ marginBottom: '8px', width: '100%' }}>
                    <Checkbox
                      checked={checkboxStates[id]}
                      onChange={() => handleCheckboxChange(id, label)}
                      label={label}
                    />
                  </Popover.Section>
                ))}
              </Popover.Pane>
              </Box>
            </Popover>
          </Scrollable>
        

        </Box>


        {/*  when a checkbox is selected */}
        {selectedOptions.length > 0 && selectedOptions.map(option => (

          <Box
            key={option.id}
            padding="extraLoose"
            style={{
            width: '100%', fontWeight:'bold'}}   
          >
            <div style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '5px',
              marginTop: '30px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'row', // Align items horizontally
              alignItems: 'center', // Align items vertically
              justifyContent: 'space-between', // Distribute space evenly
              textalign: "left", // Align text to the left
            }}>
                
              {/* adding checked item name and other details */}
              <Text as="span" style={{fontWeight:'bold'}}>{option.label}</Text>


              <LegacyCard>
                <Badge status="success">Active</Badge>
              </LegacyCard>

              {option.id === 'Product' && (
                <Text>Total: {productCount}</Text>)}
              {option.id === 'MetaField' && (
                <Text >Total: {metafieldCount}</Text>
              )}

            </div>
          </Box>
        ))}

        {selectedOptions.length === 0 && (
          <>
            <img
              src="data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2026.3.1,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20x='0px'%20y='0px'%20viewBox='0%200%20226%20226'%20style='enable-background:new%200%200%20226%20226;'%20xml:space='preserve'%3e%3cstyle%20type='text/css'%3e%20.st0{display:none;fill:%23273371;}%20.st1{display:none;fill:%235D6BB1;}%20.st2{fill:%23CDCCCC;}%20.st3{fill:none;stroke:%23FFFFFF;stroke-width:12;stroke-linecap:round;stroke-miterlimit:10;}%20%3c/style%3e%3ccircle%20class='st0'%20cx='120.75'%20cy='102.7'%20r='89.42'/%3e%3cpath%20class='st1'%20d='M199.35,180.6c-21.77,27.66-93.11,34.91-127.33,31.24s-60.79-64.02-57.74-112.3s15.13-85.88,51.34-63.67%20s8.5,50.51,38.19,72.55S223.33,150.12,199.35,180.6z'/%3e%3cpath%20class='st2'%20d='M162.72,161.08V61.52c0-12.8-11.57-22.49-24.17-20.26l-55.18,9.8c-9.82,1.74-16.98,10.28-16.98,20.26v89.76%20c0,11.36,9.21,20.57,20.57,20.57h55.18C153.51,181.65,162.72,172.44,162.72,161.08z'/%3e%3cline%20class='st3'%20x1='89.36'%20y1='100.23'%20x2='139.74'%20y2='100.23'/%3e%3cline%20class='st3'%20x1='89.36'%20y1='125.6'%20x2='139.74'%20y2='125.6'/%3e%3cline%20class='st3'%20x1='89.36'%20y1='150.96'%20x2='139.74'%20y2='150.96'/%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3c/svg%3e"
              alt=""
              style={{ width: '25%', height: '60%', objectFit: 'cover', borderRadius: '8px', marginTop: '30px' }}
            />
            <Box padding="extraLoose" textalign="center">
              <Text>Choose data for your Export file...</Text>
            </Box>
          </>
        )}
        <Box style={{ textalign: 'center', marginTop: '20px' }}>

          {/* Button to Import */}
          <Button
            onClick={() => {
              try {
                if (selectedOptions.length === 1 && selectedOptions[0].id === 'Product') {
                  // Export only product data
                  exportProductData();
                } else if (selectedOptions.length === 1 && selectedOptions[0].id === 'MetaField') {
                  // Export only Metafield data
                  exportMetaFieldData();
                } else {
                  // Export all selected data (product and metafields)
                  exportAllData();
                }
                // setSuccessBannerVisible(true);                         // make banner success visible
              }

              catch (error) {
                setFailureBannerVisible(true)                           // display failre banner
              }

            }}
            primary
          >
            Download CSV File
          </Button>
        </Box>

        <Box style={{marginTop:'10px' ,maxWidth:'400px', width:'100%'}}>
          {successBannerVisible && (
            <Banner
              title="Export successful"
              status="success"
              action={{ content: 'OK', onAction: () => setSuccessBannerVisible(false) }}
              onDismiss={() => setSuccessBannerVisible(false)}
            >
               <Text color="success" variation="positive">Your data has been successfully exported.</Text>
            </Banner>
          )}

          {failureBannerVisible && (
            <Banner
              title="Export failed"
              status="critical"
              action={{ content: 'Retry Export', onAction: () => setFailureBannerVisible(false) }}
              onDismiss={() => setFailureBannerVisible(false)}
              >
              <Text variation="negative">Oops! Something went wrong during the export process. Please try again.</Text>
            </Banner>
          )}
        </Box>
      </Box>
    </div>
  )
}

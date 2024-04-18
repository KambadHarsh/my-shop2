import { Page, Grid, LegacyCard, Layout } from '@shopify/polaris';
import React ,{useState} from 'react';
import useApiRequest from '../hooks/useApiRequest';
import { Add, Delete } from '@mui/icons-material';
import { useAuthenticatedFetch} from '@shopify/app-bridge-react';
import "../App.css";
import axios from 'axios'; 

export default function Product() {
  


  let { responseData, isLoading, error } = useApiRequest("/api/products/info", "GET");
  let [isModalOpen, setIsModalOpen] = useState(false);
  let [formData, setFormData] = useState({});
  let fetch = useAuthenticatedFetch();

  function productHandler(productid){ 
  let searchProduct =responseData?.data.find(elm => elm.id === productid);
  console.log(searchProduct);
  }



  let createHandler = async() => {
    try { 
      let request = await fetch("/api/product/create", {
        method: "POST",
      });
      let response = await request.json();
      console.log(response);
    }catch(error) {
      console.log(error)
    }
  }
  


  

  let deleteHandler = async () => {
    console.log("Product Deleted");
  }

  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <button variant="primary" onClick={createHandler} className='button'> New <Add /> </button>
          <button variant="primary" onClick={deleteHandler} className='button'> Delete  <Delete /> </button>
        </Layout.Section>

        <Layout.Section>

          <Grid>{
            !isLoading && responseData.data.map((product) => (
            <Grid.Cell key={product.id} columnSpan={{xs: 6, sm: 6, md: 2, lg: 4, xl: 3}}>
              <div className="card" onClick={() => productHandler(product.id)}>
            <LegacyCard >
            <img src={product?.image?.src} alt="Product Media" className='product-image'/>
            <h2 className="product-title">{product.title}</h2>
            <p className="product-price">${product.variants[0].price}</p>
            </LegacyCard>
            </div>
          </Grid.Cell>  
            ))
          }

          </Grid>
        </Layout.Section>
      </Layout>

      {
      isModalOpen && (
          <div className='product-modal'>
            <p className="btn-close" onClick={() => setIsModalOpen(false)}>X</p>
            <div className="modal-form">
              <form onSubmit={submitHandler}>
                <div className="image-block">
                  <img src={formData?.image?.src} alt="product media" />
                </div>
                <div className="form-fields">
                  <input type="hidden" name="id" value={formData.id}/>
                  <input type="text" name="title" id="title" value={formData.title} onChange={valueHandler} />
                  <input type="number" name="formData.variants[0].price" id="price" value={formData.variants[0].price} onChange={valueHandler}/>
                  <textarea name="body_html" id="body_html" cols="30" rows="10" value={ formData.body_html } onChange={valueHandler}></textarea>
                  <input type="text" name="handle" id="handle" value={formData.handle} onChange={valueHandler}/>
                  <input className='button' type="submit" value="Update" />
                </div>
              </form>
            </div>
          </div>
        )
      }
    </Page>
  );
} 
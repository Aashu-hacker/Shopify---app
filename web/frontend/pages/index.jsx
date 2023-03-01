import {
  Page, Stack, TextField, Button, Tabs, Card, IndexTable, useIndexResourceState
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from 'react';
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function HomePage() {

  const fetch = useAuthenticatedFetch();


//----------------------function start here------------------------------------------

//------------------------Store Url----------------------------------------

  const [text, setText] = useState();
  const [fetchProducts, setfetchProducts] = useState('')

  const handleSubmit = async () => {
    await fetch("/api/custom/fetch", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'url': text
      })
    })
    // /window.localStorage.setItem('text', text)
      .then((response) => response.json())
      .then((data) => { setfetchProducts(data.url) })
      .catch((err) => {
        console.log(err.message);
      });
    console.log("responce", fetchProducts);
  }


  const linkurl = async () => {
   await fetch("/api/custom/find",{
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
      
  }) 
  .then((response) => response.json())
  .then((data) => { setText(data.url)
  console.log(data);})
    
  }



  useEffect(async() => {
    linkurl();
  }, []);

  const handleChange = useCallback((text) => setText(text), []);

//----------------find url------------------------------------------------


  //-----------------synch products-----------------------------------------------

  const [saveData, setSaveData] = useState();
  const handleSubmitButton = async () => {
    await fetch(fetchProducts)
      .then((response) => response.json())
      .then((data) => { setSaveData(data) })
      .catch((err) => {
        console.log(err.message);
      });
    console.log(saveData);
  };

  //-------------save products---------------------------------------------------

  const handleClick = async () => {
    await fetch("/api/products/all", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'data': saveData
      })
    })
      .then((response) => response.json())
      .then((data) => { console.log(data.products) })
      .catch((err) => {
        console.log(err.message);
      });
    console.log("success");
  }

  //---------create products----------------------------------------------------

  const handleCreateButton = async () => {
    await fetch("/api/products/new", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'create': saveData
      })
    })
      .then((response) => response.json())
      .then((data) => { console.log(data.products) })
      .catch((err) => {
        console.log(err.message);
      });
    console.log("success");
  }

  //----get products----------------------------------------------------

  const [user, setUser] = useState();
  const fetchData = async () => {
    await fetch("/api/products/get", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => { setUser(data) })
      .catch((err) => {
        console.log(err.message);
      });

  }


  //----------------------Tabs start here------------------------------------------

  const [selected, setSelected] = useState(0);
  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  )

  const tabs = [
    {
      id: 'all-customers-fitted-2',
      content: 'Input URL',
      accessibilityLabel: 'All customers',
      panelID: 'all-customers-fitted-content-2',
    },
    {
      id: 'accepts-marketing-fitted-2',
      content: 'Sync URL',
      panelID: 'accepts-marketing-fitted-Ccontent-2',
    },
    {
      id: 'accepts-product-fitted-3',
      content: 'List of Products',
      panelID: 'accepts-product-fitted-Ccontent-3',
    },
  ];

  //----------------------Index Table start here------------------------------------------

  const resourceName = {
    singular: 'customer',
    plural: 'customers',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(user);


  const rowMarkup = user?.map(
    ({ id, title, thumbnail, vendor, published_scope }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell><img src={thumbnail} width={50} height={50}></img></IndexTable.Cell>
        <IndexTable.Cell> <p variant="bodyMd" fontWeight="bold" as="span">{title}</p></IndexTable.Cell>
        <IndexTable.Cell>{published_scope}</IndexTable.Cell>
        <IndexTable.Cell>{vendor}</IndexTable.Cell>

      </IndexTable.Row>
    ),
  );


  return (

    <Page
      title="Products"
      compactTitle
      primaryAction={<Button primary onClick={handleSubmit}>Store URL</Button>}
      secondaryActions={<Button primary onClick={handleClick}>Save Data </Button>}>

 {/* tab 1 start here */}

      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted>
          <Card.Section >
            {selected === 0 &&
              <TextField
                value={text}
                id="title-{{session.title}}"
                onChange={handleChange}
                label='Enter URL'
                type='text'
                autoComplete='text' />
            }

 {/* tab 2 start here */}      

            {selected === 1 &&
              <Stack distribution="center">
                <Button primary onClick={handleSubmitButton}>Sync URL Products</Button>
                <Button primary onClick={handleCreateButton}>Create URL Products</Button>
                <Button primary onClick={fetchData}> Get Data</Button>
                <Button primary onClick={linkurl}> Find Data</Button>

              </Stack>
            }

 {/* tab 3 start here */}

            {selected === 2 &&
              <Card>
                <IndexTable
                  resourceName={resourceName}
                  itemCount={user.length}
                  selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  headings={[
                    { title: 'Images' },
                    { title: 'Title' },
                    { title: 'Type' },
                    { title: 'Vemdor' },
                  ]}
                >
                  {rowMarkup}
                </IndexTable>
              </Card>
            }
          </Card.Section>
        </Tabs>
      </Card>
    </Page>
  );
}



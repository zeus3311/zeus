import axios from 'axios';

import { setData, setHeaders, setLoading } from './dataSlice';

export function getRadarChartData(selectedRegion, state) {
  const colors = [
    "#e93f3a", "#eb4f4a", "#ed6562", "#f49b99", "#fce3e2",
    "#d0ecdb", "#86cda2", "#49b373", "#1ca152", "#00953b",
  ];
  const selectedGroups = [1, 3, 4, 7, 8];

  // Get data for selected region
  if (!state || !state[selectedRegion]) {
    return [];
  }

  const regionData = state[selectedRegion]; 

  // Check if data is loaded
  if (!regionData) {
    return [];
  }

  // Convert data to format required by Radar chart
  let formattedData = [];
  for (let groupIndex of selectedGroups) {
    const groupKey = `${selectedRegion}${groupIndex}`;

    // Check if data for the group exists
    if (!regionData["基本分析分數"][groupKey] || !regionData["技術分析分數"][groupKey]) {
      continue;
    }

    for (let i = 0; i < regionData["基本分析分數"][groupKey].length; i++) {
      // The exact format will depend on your data structure and how you want to display it
      formattedData.push({
        x: regionData["基本分析分數"][groupKey][i],
        y: regionData["技術分析分數"][groupKey][i],
        label: `Group: ${groupKey}, Index: ${i}, Name: ${regionData["name"][i]}`,
        color: colors[groupIndex],
      });
    }
  }
  
  return formattedData;
}

const serverURL = 'http://127.0.0.1:8080';
const collections = ["Sec", "Ind", "StkSH", "StkSZ", "StkHK"];
const initHeaders = ["基本分析分數", "技術分析分數", "時富雷達 (CR)", "行業", "name"];

export function fetchInitialData(dispatch) {
  console.log("fetchInitialData() start")
  let promises = [];
  for (let collection of collections) {
    // Fetch headers
    axios.get(`${serverURL}/api/v1/headers/${collection}`)
      .then(response => {
        dispatch(setHeaders({ collectionName: collection, headers: response.data }));
      })
      .catch(error => console.error(`Error: ${error}`));

    // Fetch initial data
    const encodedHeaders = encodeURI(initHeaders.join(','));
    let promise = axios.get(`${serverURL}/api/v1/${collection}/item?headers=${encodedHeaders}`)
      .then(response => {
        for (let header of initHeaders) {
          dispatch(setData({ collectionName: collection, header, data: response.data[header] }));
        }
      })
      .catch(error => console.error(`Error: ${error}`));

    promises.push(promise);
  }

  // When all data has been fetched, set loading to false
  Promise.all(promises)
    .then(() => dispatch(setLoading(false)))
    .catch((error) => console.error(`Error: ${error}`));

  console.log('fetchInitialData() done');
}

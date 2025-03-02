// Move existing usgs.js content here 

export async function fetchRiverFlow() {
  const northForkUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=11187000&period=P1D&parameterCd=00060&siteStatus=all`;
  const southForkUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=11189500&period=P1D&parameterCd=00060&siteStatus=all`;

  try {
    const [northForkRes, southForkRes] = await Promise.all([
      fetch(northForkUrl),
      fetch(southForkUrl)
    ]);

    const northForkData = await northForkRes.json();
    const southForkData = await southForkRes.json();

    return {
      northFork: processUSGSData(northForkData),
      southFork: processUSGSData(southForkData)
    };
  } catch (error) {
    console.error('Error fetching river flow data:', error);
    return { northFork: [], southFork: [] };
  }
}

function processUSGSData(data) {
  if (!data.value.timeSeries[0]) return [];
  
  return data.value.timeSeries[0].values[0].value.map(reading => ({
    timestamp: reading.dateTime,
    flow: parseFloat(reading.value)
  }));
} 
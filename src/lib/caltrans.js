export async function fetchRoadClosures() {
    try {
      const [d8Response, d9Response] = await Promise.all([
        fetch('https://cwwp2.dot.ca.gov/data/d8/lcs/lcsStatusD08.json'),
        fetch('https://cwwp2.dot.ca.gov/data/d9/lcs/lcsStatusD09.json'),
      ]);
      const d8Data = await d8Response.json();
      const d9Data = await d9Response.json();
      const allClosures = [...(d8Data.closures || []), ...(d9Data.closures || [])];
      return allClosures.filter(closure => closure.route === '178' || closure.route === '155');
    } catch (error) {
      console.error('Error fetching road closures:', error);
      return [];
    }
  }
export async function GET() {
  try {
    // API key is only accessible on the server
    const apiKey = process.env.UNSPLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    
    if (!apiKey) {
      throw new Error('Unsplash API key is not configured');
    }
    
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=lake+isabella+kern+river&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${apiKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return only the necessary data to reduce payload size
    const processedData = {
      urls: {
        regular: data.urls.regular
      },
      user: {
        name: data.user.name,
        links: {
          html: data.user.links.html
        }
      }
    };
    
    return Response.json(processedData);
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    
    // Return fallback data
    return Response.json({
      urls: {
        regular: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max"
      },
      user: {
        name: "Unsplash",
        links: {
          html: "https://unsplash.com"
        }
      },
      error: error.message
    });
  }
} 
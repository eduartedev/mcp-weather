import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: 'MyServer',
    version: '1.0.0',
});

// Herramientas
server.tool(
    'fetch-weather', // title of the tool
    'Tool to fetch weather of location', // description of the tool
    {
        location: z.string().describe('Location to fetch the weather for'),
    }, // inputs del tool
    async ({ location }) => {
        try {
            // Obtener latitud y longitud
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=es&format=json`);
        
            const geoData = await geoResponse.json();
            if (!geoData.results || geoData.results.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No results found for ${location}.`
                        }
                    ]
                };
            }

            const { latitude, longitude } = geoData.results[0];

            // Obtener datos del clima
            const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_min,temperature_2m_max&hourly=temperature_2m&current=temperature_2m,precipitation,weather_code,rain,relative_humidity_2m,is_day,cloud_cover,apparent_temperature&timezone=auto&forecast_days=3`);

            const weatherData = await weatherResponse.json();

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(weatherData, null, 2)
                    }
                ]
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ]
            };
        }
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
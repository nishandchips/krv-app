# Kern Transit Schedule & Fees Card

This component displays transit schedules and fees for Kern Transit bus lines 150, 220, and 227 serving the Kern River Valley area.

## Features

- Tabbed interface for easy navigation between different bus lines
- Toggle between schedule and fare information
- Displays detailed stop information including arrival and departure times
- Shows fare details and payment information

## Data Source

The component uses GTFS (General Transit Feed Specification) data from Kern Transit, available at:
https://kerntransit.org/developers-gtfs/

### Data Processing

The GTFS data is processed in the following way:

1. The GTFS zip file is downloaded from Kern Transit
2. The data is extracted and parsed
3. Only the relevant routes (150, 220, 227) are extracted
4. The data is transformed into a format suitable for display
5. The processed data is stored as JSON

### Data Update Process

To update the transit data:

1. Run `npm run fetch-transit` to fetch and process the latest GTFS data
2. This will update the processed data file at `src/data/transit/processed/transit_data.json`

## Implementation Details

- The component uses a tabbed interface to switch between different bus lines
- Each tab displays schedule and fare information for a specific bus line
- The schedule view shows a table of stops with arrival and departure times
- The fares view shows pricing information and payment details

## Future Improvements

- Add a map view showing the bus route and stops
- Implement real-time bus tracking if available from Kern Transit
- Add a search feature to find specific stops or times
- Implement a trip planner feature 
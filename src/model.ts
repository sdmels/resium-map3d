export interface Flight {
  flight_date: string;
  flight_status: string;
  departure: Departure;
  arrival: Arrival;
  airline: Airline;
  flight: FlightDetails;
  aircraft?: any;
  live?: any;
}

export interface FlightDetails {
  number: string;
  iata: string;
  icao?: any;
  codeshared?: any;
}

export interface Airline {
  name: string;
  iata: string;
  icao?: any;
}

export interface Arrival {
  airport: string;
  timezone: string;
  iata: string;
  icao: string;
  terminal: string;
  gate?: any;
  baggage?: any;
  delay: number;
  scheduled: string;
  estimated: string;
  actual?: any;
  estimated_runway?: any;
  actual_runway?: any;
}

export interface Departure {
  airport: string;
  timezone: string;
  iata: string;
  icao: string;
  terminal?: any;
  gate?: any;
  delay?: any;
  scheduled: string;
  estimated: string;
  actual: string;
  estimated_runway?: any;
  actual_runway?: any;
}

export interface Pagination {
  count: number;
  limit: number;
  offset: number;
  total: number;
}

export type FlightRadar = { data: Flight[]; pagination: Pagination };

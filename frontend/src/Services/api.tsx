import axios from "axios";
 // Import the backend URL from the ENV file
const API_URL = import.meta.env.VITE_SERVER || "http://localhost:8000"
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

 

export default {
  axiosClient
};
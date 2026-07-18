import axios from "axios";

const BACKEND_BASE_URL = "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});

export default api;

// Register API: http://localhost:4000/api/v1/auth/register

/*
fetch(http://localhost:4000/api/v1/auth/register,{
method:"post",
headers: {"Content-Type":"application/json"},
creadentials: true,
body: JSON.strigify({})
})
*/

/*
api.post("/auth/register",data,{header:""})
*/
/**
* This JavaScript file contains the implementation of NICE-HMS API.
* This file provides examples of how to use the NICE-HMS API in JavaScript, specifically for generating an authorization token and using it in subsequent calls.
* To use the NICE-HMS API, first generate an authorization token by calling the authToken function. 
* This token has a short life span of 15 to 30 minutes. Use this token in subsequent calls to authenticate and access NICE-TIME resources.
* Example usage:
    const authToken = await authToken().token;
    const headers = { Authorization: Bearer ${authToken} };
*
 */


const { default: axios } = require("axios");
const dotenv = require('dotenv')
dotenv.config()


const domain=process.env.DOMAIN
const email = process.env.EMAIL
const password = process.env.PASSWORD


const authToken = async()=>{
    // implementation of function to generate auth token goes here
    // ...
    // return the token in the following format: { token: "xxxx" }

    const uri = `${domain}auth_token`;
    const res = await axios.post(uri, {"email" : email, "password" : password, "returnSecureToken" : true}).then(res=>res.data)
    return res
}




const dischargeSummary = async()=>{
    // This function creates a discharge summary and returns the composition ID that you need to store for edit, read, and delete operations.
    // Note That DOA and DOD are properties of Encounter which with dealt subsequent APIs
    const token = await authToken().then(data=>data.token)
    const body = {
        abhaAddress : "savitribilagi@sbx",
        text : `<div>Cough with APD</div><div>cough</div><div>BP 140/80 PR 87/min RR 20/min</div>`,
        doctorName : "Dr Umesh Bilagi",
        doctorGcpId : `cf4a6ab1-3f32-4b92-adc5-89489da6ca14`,
        status : `final`,
        date : `2023-05-06T02:38:41.986Z`
    }

    // passing tken in header
    config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    const uri = `${domain}discharge_summary`
    const res = await axios.post(uri, body, config).then(res=>res.data);

    console.log(res)
    return res.composition.id
}





dischargeSummary()
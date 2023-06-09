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

const express = require("express")
const niceIntegration = require("nice-hms-integration")

const app = express();

app.get("/", (req, res)=> res.status(200).send("hello world"))

app.get("/authToken", async(req, res)=>{
    const _res= await niceIntegration.authToken(email, password, domain)
    res.status(200).send(_res)
})

app.get("/dischargeSummary", async(req, res)=>{
    let token = await niceIntegration.authToken(email, password, domain).then(res=>res.token)

    const comp =  await niceIntegration.dischareSummary({
        "abhaAddress" : "savitribilagi@sbx",
        "date" : new Date().toISOString(),
        "doctorDetails" :  [{"doctorName" : "Dr Umesh Bilagi", "doctorGcpId" :"cf4a6ab1-3f32-4b92-adc5-89489da6ca14" },
        {"doctorName" : "Dr Rajesh Patil", "doctorGcpId" :"28de92ca-3ba4-4c7b-b97c-94ec21d2b60c" }
        ],
        "status" : "final",
        "text" :  "<div>Cough with APD</div><div>cough</div><div>BP 140/80 PR 87/min RR 20/min</div>"
    }, token, domain).then(res=>res)

    res.status(200).json({comp})
    })


app.listen(2500)





const authToken = async()=>{
    // implementation of function to generate auth token goes here
    // ...
    // return the token in the following format: { token: "xxxx" }

    const uri = `${domain}auth_token`;
    const res = await axios.post(uri, {"email" : email, "password" : password, "returnSecureToken" : true}).then(res=>res.data)
    // console.log(res)
    return res
}

/**
 * ================
 * 
 * PATIENT
 * 
 * ==================
 * 
 */

const getPatientById = async ()=>{
    const token = await authToken().then(data=>data.token)
    // passing tken in header
     const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    const body ={
        patientId :231
    }
    const uri =`${domain}patient_by_id`
    const res = await axios.post(uri, body, config).then(res=>res.data)
    console.log(res)
    return res
}


const getPatientByAbhaAddress = async ()=>{
    const token = await authToken().then(data=>data.token)
    // passing tken in header
     const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    const body ={
        abhaAddress :`savitribilagi@sbx`
        
    }
    const uri =`${domain}patient_by_abhaAddress`
    const res = await axios.post(uri, body, config).then(res=>res.data)
    console.log(res)
    return res
}



/**
 * ======================
 *  Encounter
 * =======================
 */

const admitPatient = async()=>{

    const token = await authToken().then(data=>data.token)
    // passing tken in header
     const config = {
        headers: { Authorization: `Bearer ${token}` }
    }
    const body={
        abhaAddress : "savitribilagi@sbx",
        doa : new Date().toISOString(),
        doctorDetails : [{doctorName: "Dr Umesh Bilagi", doctorGcpId:`cf4a6ab1-3f32-4b92-adc5-89489da6ca14`}]
    }
    const uri =`${domain}admit_patient`

    const res = await axios.post(uri, body, config).then(res=>res.data).catch(er=>console.log(er.response))
    console.log(res)

    return res

}


/**
 * =====================
 * BUNDLE
 * =====================
 * 
 */

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







// authToken()
// getPatientById()
// getPatientByAbhaAddress()
// admitPatient()
// dischargeSummary()
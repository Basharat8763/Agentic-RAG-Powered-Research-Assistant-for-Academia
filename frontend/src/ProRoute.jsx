import React from "react";
import { Navigate } from "react-router-dom";

const ProtectRoute =({children})=>{
    const isAunthenticated = ()=>{
        const token  = localStorage.getItem("authToken")
        return token
    }
return isAunthenticated() ? children : <Navigate to={'/'} />
     
     
    }
export default ProtectRoute;
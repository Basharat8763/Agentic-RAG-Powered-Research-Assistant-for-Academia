import { Navigate } from "react-router-dom";
import React from "react";

const LoginSpecial = ({ children }) => {

    const isAuthenticated = () => {
        return localStorage.getItem('authToken')
    }
    
    return isAuthenticated() ? <Navigate to={'/dashBoard'} /> : children
}

export default LoginSpecial;
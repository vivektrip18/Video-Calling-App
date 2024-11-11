import { Navigate } from "react-router-dom"

export const ProtectedRoute = ({isloggedin,children}) => {

    if(!isloggedin){
        return <Navigate to={"/"} replace/>
    }

    return children;
}
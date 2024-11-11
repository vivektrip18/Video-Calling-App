import { Button } from "@nextui-org/react"
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";


export const Header = ({user,profile,setUser,setProfile,setLoggedin,isloggedin}) => {
    const navigate = useNavigate();
    const logOut = () => {
        googleLogout();
        setProfile(null);
        setUsername(null); // Clear the username in state
        setUser(null); // Clear any other user-related state
        localStorage.removeItem("user"); // Clear any stored user data in local storage
        sessionStorage.removeItem("user"); // Or session storage if used
        setLoggedin(false);
    };

    return <div className="p-4 bg-gray-900 flex">
        <div className="text-right">
            {/* {name[0]} */}
        </div>
        <Button onClick={() => {
            logOut
            navigate("/")           
        }}  color="secondary"  className="text-right">
            LogOut
        </Button>
    </div>
}
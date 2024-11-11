import { Input, Button } from "@nextui-org/react";
import React from "react";
import { useNavigate } from "react-router-dom";


export const HomePage = ({  setLoggedin,username,setUsername }) => {

    const navigate = useNavigate();

    const handlelogin = () =>{
        setLoggedin(true);
        navigate("/meeting");
    }

    
    return (
        <div className="h-screen flex justify-center items-center ">
            <div className="flex flex-col justify-center items-center w-full max-w-sm bg-gray-900 rounded-lg p-6">
                <div className="text-xl font-bold pb-4 pt-2 text-center text-white">
                    Login
                </div>
                <div>
                    <Input type="name"
                    label="Name"
                    radius="sm"
                    placeholder="Enter your name"
                    className="max-w-[220px] pb-4"
                    onChange={(e)=>{setUsername(e.target.value)}}
                    onKeyUp={(e)=>{
                        if(e.key==="Enter"){
                            handlelogin();
                            console.log(username)
                        }
                    }}
                    />

                </div>
                <div className=" flex justify-center w-full rounded-lg">

                    <Button  onClick={handlelogin} 
                    color="secondary" variant="solid">
                        Join
                    </Button>
                    
                </div>
            </div>
        </div>



    )
}
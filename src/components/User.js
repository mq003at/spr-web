import { createContext, useState } from "react";

export const UserContext = createContext();

function User(props) {

  const user = {
    shopId: "",
    user: "",
    shopChosen: "",
  };
 
  const [userSession, setUserSession] = useState(user);

  const setUserContext = (userContext) => {
    console.log(userSession);
    setUserSession({ ...userSession, ...userContext });
  };

  return <UserContext.Provider value={{ ...userSession, setUserContext }}>{props.children}</UserContext.Provider>;
}

export {User};

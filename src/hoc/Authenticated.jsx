// Accessible only if the user is authenticated, if no go to loggin

function Authenticated({ children }) {
  return <div>{children}</div>;
}

export default Authenticated;
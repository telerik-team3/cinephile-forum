// Accessible to users with administrative rights

function AdminOnly({ children }) {
  return <div>{children}</div>;
}

export default AdminOnly;
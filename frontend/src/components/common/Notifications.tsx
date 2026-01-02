import { useEffect, useState } from "react";
import { api } from "../../services/api";

const Notifications = ({ role }: { role: string }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/notifications?toRole=${role}&read=false`).then(setItems);
  }, []);

  return (
    <div>
      <h4>Notifications</h4>
      {items.map((n: any) => (
        <p key={n.id}>{n.message}</p>
      ))}
    </div>
  );
};

export default Notifications;

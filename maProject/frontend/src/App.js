// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { fetchItems } from './services/api';

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems().then((data) => {
      setItems(data);
    }).catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>My Items</h1>
      {items.map((item) => (
        <p key={item.id}>{item.name}</p>
      ))}
    </div>
  );
}

export default App;

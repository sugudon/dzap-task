import React from 'react';
 
import Disperse from './components/Disperse';

const App: React.FC = () => { 
  return (
    <div className="container mx-auto p-4">
      <Disperse labelText="Addresses with Amounts" />
    </div>
  );
}

export default App;

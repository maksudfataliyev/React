import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="header">
        <span className='birbank'>birbank</span>
        <span className="phone">+994 453 34 34</span>
      </header>

      <main>
        <h2>Documents for signing</h2>
        <div className="section">
          <h3 className='currency'>Currency exchange:</h3>
          <ul>
            <p className='firstdoc'>Madaxil qebzii.pdf</p>
            <p className='seconddoc'>Valyutanin nagd satisina dair aknet</p>
          </ul>
          <button className="sign-button">Sign documents</button>
        </div>

        <div className="section">
          <h3 className='card'>Plastic card order:</h3>
          <ul>
            <p className='thirddoc'>Anket.pdf</p>
            <p className='fourthdoc'>Imza numunesi</p>
          </ul>
          <button className="sign-button">Sign documents</button>
        </div>
      </main>
    </div>
  );
};

export default App;

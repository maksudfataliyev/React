import { Component } from 'react';
import './App.css';
import picture from './components/9781435159631_p0_v1_s1200x630.jpg'
function App() {
  return (
    <div>
      <h1>Автор:Джейн Остин </h1>
      <h1>Количество страниц: 279</h1>
      <img src = {picture}/>
    </div>
  );
}


class Appp extends Component{
  render(){
    return(
    <div>
      <h1>Автор:Джейн Остин </h1>
      <h1>Количество страниц: 279</h1>
      <img src = {picture}/>
    </div>
    );
    
  }
}
export default Appp;


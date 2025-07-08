import './App.css';
import image from './content/download.jpg'

function App() {
  return (
    <div>
      <h1>Country:Azerbaijan</h1>
      <h1>City:Baku</h1>
      <h1>Establishment date:1991</h1>
      <img src={image}></img>
    </div>
  );
}

class Appp extends Component{
  render(){
    return(
      <div>
      <h1>Country:Azerbaijan</h1>
      <h1>City:Baku</h1>
      <h1>Establishment date:1991</h1>
      <img src={image}></img>
    </div>
    );
      
  }
}

export default App;
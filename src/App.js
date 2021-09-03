import './App.css';
import { useRef, useState } from 'react';
import {ProgressBar} from 'react-bootstrap';
import axios from 'axios';

function App() {
  const [uploadPercentage,setUploadPercentage] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [resourceUrl,setResourceUrl] = useState("")
  const fileInput = useRef(null)
  

  const handleClick = e => {
    fileInput.current.click();
  }
  
  const selectFile = (e) => {
    setSelectedFile(e.target.files[0])
    
  }
  
  const uploadFile = () =>{
    console.log(selectedFile)
    let data = new FormData();
    data.append( 'file', selectedFile );

    const options = {
      onUploadProgress: (progressEvent) => {
        const {loaded, total} = progressEvent;
        let percent = Math.floor( (loaded * 100) / total )
        console.log( `${loaded}kb of ${total}kb | ${percent}%` );

        if( percent < 100 ){
          setUploadPercentage(percent)
        }
      }
    }

    axios.post(
      'https://dev.homingos.com/homingo/admin/upload/getS3SignedUrl',
      { 
        filename: selectedFile.name,
      },
      { headers: {
        'Content-Type': 'application/json',
        Authorization : "36c7770d-e525-461c-bd3e-b4e80470deb4",
        Cookie: "JSESSIONID=882F7E0430F726E011BEB4BB80E9C81D"
        },
      
      },

    ).then(res => {
    setResourceUrl(res.data.data.resourceUrl)
    axios.put(res.data.data.uploadUrl, data, options).then(res => { 
        console.log(res)
        setUploadPercentage(100, ()=>{
          setTimeout(() => {
            setUploadPercentage(0)
          }, 1000);
        })
    }).catch(err => console.log(err))
    })
  }
  
  
    // const {uploadPercentage} = this.state;
    return (
      <div className="App">
        <input className="input" type="file" onChange={(e) => selectFile(e)} ref={fileInput}/>
        <button onClick={handleClick}>Select File</button>
        <button onClick={(e) => uploadFile(e)}> Upload </button>
        { uploadPercentage > 0 && <ProgressBar now={uploadPercentage} active label={`${uploadPercentage}%`} />}
        <br />
        <span>The file is available here:</span>
        <a href={resourceUrl}>Click Here</a>
      </div>
    );
  }


export default App;

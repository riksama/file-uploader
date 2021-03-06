import './App.css';
import { useState } from 'react';
import axios from 'axios';

import { Dropdown } from 'react-dropdown-now';
import 'react-dropdown-now/style.css';

function App() {
  const [uploadPercentage,setUploadPercentage] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [resourceUrl,setResourceUrl] = useState("")
  const [mimetype,setMimetype] = useState("")
  
  const selectFile = (e) => {
    setSelectedFile(e.target.files[0]) 
  }
  
  if(selectedFile){
  var { name: fileName} = selectedFile;
  }
    
  const uploadFile = () =>{
    console.log(selectedFile)
    let data = new FormData();
    data.append( 'file', selectedFile, fileName );

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
  

    return (
      <div className="App">
        <Dropdown
          placeholder="Select file type"
          options={['application', 'audio', 'image','message','text','video','x-world']}
          onChange={(value) => console.log('change!', value)}
          onSelect={(value) => { 
            setMimetype(value.label)
            console.log('selected!', value)}} // always fires once a selection happens even if there is no change
          onClose={(closedBySelection) => console.log('closedBySelection?:', closedBySelection)}
          onOpen={() => console.log('open!')}
        />
        <div className="file-input">
          <input type="file" id="file" className="file" onChange={(e) => selectFile(e)} accept={`${mimetype}/*`}/>
          <label htmlFor="file">Select file</label>
          <p className="file_name">{fileName}</p>
          <button className="upload_button" onClick={(e) => uploadFile(e)}> Upload </button>
        </div>
        
        <br />
        <span className="progress">{ uploadPercentage > 0 && `${uploadPercentage}%` }</span>
        <br />
        { uploadPercentage === 100 && 
        <div className="download" >
          <span className="text">The file is available here:</span>
          <a href={resourceUrl}>Click Here</a>
        </div>}
      </div>
    );
  }


export default App;
